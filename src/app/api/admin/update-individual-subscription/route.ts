import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const formData = await request.formData();
  const id = formData.get("id") as string;
  const subscription_active = formData.get("subscription_active") === "true";
  const subscription_type = formData.get("subscription_type") as string;

  const { error } = await supabase
    .from("individuals")
    .update({
      subscription_active,
      subscription_type,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
