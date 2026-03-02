import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { id, email, full_name, phone } = await req.json();
  if (!id || !email) {
    return NextResponse.json({ error: "Missing user id or email" }, { status: 400 });
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.from("guardians").upsert({
    id,
    email,
    full_name: full_name ?? null,
    phone: phone ?? null,
    is_admin: false,
  }, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
