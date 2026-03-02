"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { makePublicId } from "@/lib/ids";
import { generateQrPngDataUrl, dataUrlToBuffer } from "@/lib/qr/generate";

const createSchema = z.object({
  display_name: z.string().min(1),
  date_of_birth: z.string().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  contact_name: z.string().min(1),
  contact_relation: z.string().optional(),
  contact_phone: z.string().min(5),
  guardian_full_name: z.string().optional(),
  guardian_phone: z.string().optional(),
});

export async function createIndividual(formData: FormData) {
  const parsed = createSchema.safeParse({
    display_name: String(formData.get("display_name") ?? ""),
    date_of_birth: String(formData.get("date_of_birth") ?? "") || undefined,
    allergies: String(formData.get("allergies") ?? "") || undefined,
    medical_notes: String(formData.get("medical_notes") ?? "") || undefined,
    contact_name: String(formData.get("contact_name") ?? ""),
    contact_relation: String(formData.get("contact_relation") ?? "") || undefined,
    contact_phone: String(formData.get("contact_phone") ?? ""),
    guardian_full_name: String(formData.get("guardian_full_name") ?? "") || undefined,
    guardian_phone: String(formData.get("guardian_phone") ?? "") || undefined,
  });

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Not authenticated" };
  if (!auth.user.id) return { ok: false, message: "User ID not found" };


  // Update guardian profile info if provided
  if (parsed.data.guardian_full_name || parsed.data.guardian_phone) {
    await supabase
      .from("guardians")
      .update({
        ...(parsed.data.guardian_full_name ? { full_name: parsed.data.guardian_full_name } : {}),
        ...(parsed.data.guardian_phone ? { phone: parsed.data.guardian_phone } : {}),
      })
      .eq("id", auth.user.id);
  }

  const public_id = makePublicId();
  if (!public_id) return { ok: false, message: "Failed to generate public ID" };

  const { data: indiv, error: iErr } = await supabase
    .from("individuals")
    .insert({
      guardian_id: auth.user.id,
      display_name: parsed.data.display_name,
      date_of_birth: parsed.data.date_of_birth ?? null,
      allergies: parsed.data.allergies ?? null,
      medical_notes: parsed.data.medical_notes ?? null,
      public_id,
      is_public: true,
    })
    .select("id, public_id")
    .single();

  if (iErr) return { ok: false, message: iErr.message };
  if (!indiv || !indiv.id) return { ok: false, message: "Failed to create individual record" };

  const { error: cErr } = await supabase.from("emergency_contacts").insert({
    individual_id: indiv.id,
    name: parsed.data.contact_name,
    relation: parsed.data.contact_relation ?? null,
    phone: parsed.data.contact_phone,
    priority: 1,
  });
  if (cErr) return { ok: false, message: cErr.message };

  // QR code is NOT generated here. It will be generated only after a successful product purchase.
  return { ok: true, id: indiv.id };
}

const updateSchema = z.object({
  display_name: z.string().min(1),
  date_of_birth: z.string().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  contact_name: z.string().min(1),
  contact_relation: z.string().optional(),
  contact_phone: z.string().min(5),
  guardian_full_name: z.string().optional(),
  guardian_phone: z.string().optional(),
});

export async function updateIndividual(
  individualId: string,
  formData: FormData
) {
  if (!individualId) return { ok: false, message: "Invalid individual ID" };

  const parsed = updateSchema.safeParse({
    display_name: String(formData.get("display_name") ?? ""),
    date_of_birth: String(formData.get("date_of_birth") ?? "") || undefined,
    allergies: String(formData.get("allergies") ?? "") || undefined,
    medical_notes: String(formData.get("medical_notes") ?? "") || undefined,
    contact_name: String(formData.get("contact_name") ?? ""),
    contact_relation: String(formData.get("contact_relation") ?? "") || undefined,
    contact_phone: String(formData.get("contact_phone") ?? ""),
    guardian_full_name: String(formData.get("guardian_full_name") ?? "") || undefined,
    guardian_phone: String(formData.get("guardian_phone") ?? "") || undefined,
  });
  // Update guardian profile info if provided
  if (parsed.data.guardian_full_name || parsed.data.guardian_phone) {
    await supabase
      .from("guardians")
      .update({
        ...(parsed.data.guardian_full_name ? { full_name: parsed.data.guardian_full_name } : {}),
        ...(parsed.data.guardian_phone ? { phone: parsed.data.guardian_phone } : {}),
      })
      .eq("id", auth.user.id);
  }

  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Not authenticated" };

  // Verify ownership
  const { data: indiv, error: checkErr } = await supabase
    .from("individuals")
    .select("id, guardian_id")
    .eq("id", individualId)
    .single();

  if (checkErr || !indiv) return { ok: false, message: "Individual not found" };
  if (indiv.guardian_id !== auth.user.id) return { ok: false, message: "Not authorized" };

  // Update individual record
  const { error: updateErr } = await supabase
    .from("individuals")
    .update({
      display_name: parsed.data.display_name,
      date_of_birth: parsed.data.date_of_birth ?? null,
      allergies: parsed.data.allergies ?? null,
      medical_notes: parsed.data.medical_notes ?? null,
    })
    .eq("id", individualId);

  if (updateErr) return { ok: false, message: updateErr.message };

  // Update or create emergency contact
  const { data: existingContact } = await supabase
    .from("emergency_contacts")
    .select("id")
    .eq("individual_id", individualId)
    .eq("priority", 1)
    .maybeSingle();

  if (existingContact) {
    const { error: contactErr } = await supabase
      .from("emergency_contacts")
      .update({
        name: parsed.data.contact_name,
        relation: parsed.data.contact_relation ?? null,
        phone: parsed.data.contact_phone,
      })
      .eq("id", existingContact.id);

    if (contactErr) return { ok: false, message: contactErr.message };
  } else {
    const { error: contactErr } = await supabase.from("emergency_contacts").insert({
      individual_id: individualId,
      name: parsed.data.contact_name,
      relation: parsed.data.contact_relation ?? null,
      phone: parsed.data.contact_phone,
      priority: 1,
    });

    if (contactErr) return { ok: false, message: contactErr.message };
  }

  return { ok: true, id: individualId };
}

export async function deleteIndividual(individualId: string) {
  if (!individualId) return { ok: false, message: "Invalid individual ID" };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "Not authenticated" };

  // Verify ownership
  const { data: indiv, error: checkErr } = await supabase
    .from("individuals")
    .select("id, guardian_id")
    .eq("id", individualId)
    .single();

  if (checkErr || !indiv) return { ok: false, message: "Individual not found" };
  if (indiv.guardian_id !== auth.user.id) return { ok: false, message: "Not authorized" };

  // Get QR asset path to delete from storage
  const { data: qrAsset } = await supabase
    .from("qr_assets")
    .select("storage_path")
    .eq("individual_id", individualId)
    .maybeSingle();

  // Delete from storage if exists
  if (qrAsset?.storage_path) {
    const admin = supabaseAdmin();
    await admin.storage.from("qr").remove([qrAsset.storage_path]);
  }

  // Delete QR asset record
  await supabase.from("qr_assets").delete().eq("individual_id", individualId);

  // Delete emergency contacts
  await supabase.from("emergency_contacts").delete().eq("individual_id", individualId);

  // Delete individual
  const { error: deleteErr } = await supabase.from("individuals").delete().eq("id", individualId);

  if (deleteErr) return { ok: false, message: deleteErr.message };

  return { ok: true };
}

export async function getQrSignedUrl(individualId: string) {
  if (!individualId) return { ok: false, message: "Invalid individual ID" };

  const supabase = await supabaseServer();

  const { data: qr, error } = await supabase
    .from("qr_assets")
    .select("storage_path")
    .eq("individual_id", individualId)
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!qr || !qr.storage_path) return { ok: false, message: "QR code not found" };

  const admin = supabaseAdmin();
  const signed = await admin.storage.from("qr").createSignedUrl(qr.storage_path, 60);
  if (signed.error) return { ok: false, message: signed.error.message };

  return { ok: true, url: signed.data.signedUrl };
}

export async function regenerateQrCode(individualId: string) {
  if (!individualId) return { ok: false, message: "Invalid individual ID" };

  const supabase = await supabaseServer();
  const admin = supabaseAdmin();

  // Get individual details
  const { data: indiv, error: indivErr } = await supabase
    .from("individuals")
    .select("id, public_id")
    .eq("id", individualId)
    .single();

  if (indivErr || !indiv) {
    console.error("Individual not found:", indivErr);
    return { ok: false, message: "Individual not found" };
  }

  // Check if QR already exists
  const { data: existing } = await admin
    .from("qr_assets")
    .select("individual_id")
    .eq("individual_id", indiv.id)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "QR code already exists for this individual" };
  }

  // Generate QR code
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const publicUrl = `${site.replace(/\/$/, "")}/p/${indiv.public_id}`;
  
  try {
    const dataUrl = await generateQrPngDataUrl(publicUrl);
    const buf = dataUrlToBuffer(dataUrl);
    const path = `qr/${indiv.id}.png`;

    // Upload to storage
    const up = await admin.storage.from("qr").upload(path, buf, { contentType: "image/png", upsert: true });
    if (up.error) {
      console.error("Storage upload error:", up.error);
      return { ok: false, message: up.error.message };
    }

    console.log("QR uploaded to storage:", path);

    // Insert QR asset record (only insert, never update)
    const { data, error: qErr } = await admin
      .from("qr_assets")
      .insert({ individual_id: indiv.id, storage_path: path })
      .select();
    
    if (qErr) {
      console.error("QR asset insert error:", qErr);
      return { ok: false, message: `Failed to save QR: ${qErr.message}` };
    }

    console.log("QR asset created:", data);

    // Revalidate the admin QR codes page to refresh the data
    revalidatePath("/admin/qr-codes");

    return { ok: true, message: "QR code generated successfully" };
  } catch (error) {
    console.error("QR generation error:", error);
    return { ok: false, message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
