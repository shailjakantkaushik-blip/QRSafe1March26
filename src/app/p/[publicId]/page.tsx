import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QrScanLocationCapture from "@/components/individuals/qr-scan-location-capture";

export default async function PublicProfilePage({ params }: { params: { publicId?: string } } | { params: Promise<{ publicId?: string }> }) {
  // Next.js may pass params as a Promise in some dynamic routes, so always await if needed
  let resolvedParams: { publicId?: string };
  if (typeof (params as any).then === "function") {
    resolvedParams = await (params as Promise<{ publicId?: string }>);
  } else {
    resolvedParams = params as { publicId?: string };
  }
  const publicId = typeof resolvedParams.publicId === 'string' ? resolvedParams.publicId.trim() : '';
  if (!publicId) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile not found</div>
        <div className="mt-2 text-muted-foreground">
          This QR may be invalid, expired, or the profile is hidden.
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Debug: publicId is missing
      </main>
    );
  }
  const supabase = await supabaseServer();

  console.log("Public profile lookup - publicId:", publicId);

  // Get individual by public_id
  const { data: individual, error: indivError } = await supabase
    .from("individuals")
    .select(`
      id,
      display_name,
      is_public,
      allergies,
      date_of_birth,
      medical_notes,
      emergency_contacts(name, relation, phone, priority)
    `)
    .eq("public_id", publicId)
    .maybeSingle();


  console.log("Query error:", indivError);
  console.log("Individual found:", individual);

  if (indivError || !individual) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile not found</div>
        <div className="mt-2 text-muted-foreground">
          This QR may be invalid, expired, or the profile is hidden.
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Debug: publicId={publicId}, error={indivError?.message}
          <br />
          Env: NEXT_PUBLIC_SITE_URL={process.env.NEXT_PUBLIC_SITE_URL}
          <br />
          Host: {typeof window !== 'undefined' ? window.location.host : 'server'}
          <br />
          Timestamp: {new Date().toISOString()}
        </div>
        </div>
      </main>
    );
  }

  if (!individual.is_public) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <div className="text-2xl font-bold">Profile hidden</div>
        <div className="mt-2 text-muted-foreground">
          The guardian has disabled public visibility.
        </div>
      </main>
    );
  }

  const contacts = (individual.emergency_contacts ?? []).sort((a: any, b: any) => a.priority - b.priority);

  // After confirming individual is public and found, and before rendering UI:
  // Simulate scan event: get location from query or browser (for demo, use dummy values)
  const latitude = 28.6139; // Replace with real value from device/browser
  const longitude = 77.2090; // Replace with real value from device/browser
  const scannedAt = new Date().toISOString();
  // Get guardian contact info (for demo, use first contact)
  const mainContact = contacts[0];
  // if (mainContact) {
  //   // Notification logic removed
  //   // Example: send notification or log scan event here
  //   // { guardianPhone: mainContact.phone, ... }
  // }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      {/* Hidden component to capture and send scan location (client component) */}
      {individual.id && <QrScanLocationCapture individualId={individual.id} />}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Emergency profile</div>
          <div className="text-3xl font-bold">{individual.display_name ?? "—"}</div>
        </div>
        <Badge className="bg-slate-200 text-slate-700">Public</Badge>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-5">
          <div className="text-sm font-semibold">Allergies</div>
          <div className="mt-1 text-sm text-muted-foreground">{individual.allergies || "—"}</div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Medical notes</div>
          <div className="mt-1 text-sm text-muted-foreground">{individual.medical_notes || "—"}</div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold">Emergency contacts</div>
          <div className="mt-3 space-y-3">
            {contacts.length === 0 && <div className="text-sm text-muted-foreground">No contacts available.</div>}
            {contacts.map((c: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.relation || "Contact"}</div>
                </div>
                <a href={`tel:${c.phone}`}><Button>Call</Button></a>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-xs text-muted-foreground">
          In a serious emergency, call local emergency services first.
        </div>
      </div>
    </main>
  );
}
