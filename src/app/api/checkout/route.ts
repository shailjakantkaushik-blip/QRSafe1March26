import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateQrPngDataUrl, dataUrlToBuffer } from "@/lib/qr/generate";

export async function POST(req: NextRequest) {
  const { items, shipping } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  if (!shipping || !shipping.name || !shipping.email) {
    return NextResponse.json({ error: "Shipping info required." }, { status: 400 });
  }
  const supabase = supabaseAdmin();
  const results = [];
  for (const item of items) {
    // Always use UUIDs for individual_id and guardian_id
    const { error, data } = await supabase.from("orders").insert({
      product_id: item.productId,
      individual_id: item.individual_id,
      guardian_id: item.guardian_id,
      name: shipping.name,
      email: shipping.email,
      address: shipping.address,
      city: shipping.city,
      zip: shipping.zip,
      country: shipping.country,
      status: "pending",
      created_at: new Date().toISOString(),
    }).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    results.push(data?.[0]);

    // --- QR Generation Logic ---
    // Check if QR already exists for this individual
    const { data: qrExists } = await supabase
      .from("qr_assets")
      .select("individual_id")
      .eq("individual_id", item.individual_id)
      .maybeSingle();
    if (!qrExists) {
      // Get individual's public_id
      const { data: indiv } = await supabase
        .from("individuals")
        .select("id, public_id")
        .eq("id", item.individual_id)
        .maybeSingle();
      if (indiv && indiv.public_id) {
        const site = process.env.NEXT_PUBLIC_SITE_URL || "";
        const publicUrl = `${site.replace(/\/$/, "")}/p/${indiv.public_id}`;
        try {
          const dataUrl = await generateQrPngDataUrl(publicUrl);
          const buf = dataUrlToBuffer(dataUrl);
          const path = `qr/${indiv.id}.png`;
          const up = await supabase.storage.from("qr").upload(path, buf, { contentType: "image/png", upsert: true });
          if (!up.error) {
            await supabase.from("qr_assets").insert({ individual_id: indiv.id, storage_path: path });
          }
        } catch (e) {
          // Log but do not fail order
          console.error("QR generation error for individual", indiv.id, e);
        }
      }
    }
    // --- End QR Generation Logic ---
  }
  return NextResponse.json({ ok: true, orders: results });
}
