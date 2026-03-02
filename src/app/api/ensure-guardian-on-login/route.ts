import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { id, email, full_name, phone } = await req.json();
  if (!id || !email) {
    return NextResponse.json({ error: "Missing user id or email" }, { status: 400 });
  }
  const supabase = await supabaseServer();
  // Try to insert, if conflict, update only non-admin fields
  const { error } = await supabase.rpc('upsert_guardian_no_admin', {
    p_id: id,
    p_email: email,
    p_full_name: full_name ?? null,
    p_phone: phone ?? null
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
