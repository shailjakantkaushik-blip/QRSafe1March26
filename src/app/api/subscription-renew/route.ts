import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const formData = await request.formData();
  const individual_id = formData.get("individual_id") as string;
  const subscription_type = formData.get("subscription_type") as string;

  // Calculate new expiry based on type
  const now = new Date();
  let expiry = new Date(now);
  if (subscription_type === "monthly") {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (subscription_type === "quarterly") {
    expiry.setMonth(expiry.getMonth() + 3);
  } else if (subscription_type === "annual") {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }

  const { error } = await supabase
    .from("individuals")
    .update({
      subscription_active: true,
      subscription_type,
      subscription_expiry: expiry.toISOString(),
    })
    .eq("id", individual_id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
