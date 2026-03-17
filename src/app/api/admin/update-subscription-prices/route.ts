import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Check admin
  const { data: guardian } = await supabase
    .from("guardians")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!guardian?.is_admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const formData = await req.formData();
  const monthly = Number(formData.get("monthly_price"));
  const quarterly = Number(formData.get("quarterly_price"));
  const annual = Number(formData.get("annual_price"));

  // Update prices
  await supabase.from("subscription_prices").update({ price: monthly }).eq("type", "monthly");
  await supabase.from("subscription_prices").update({ price: quarterly }).eq("type", "quarterly");
  await supabase.from("subscription_prices").update({ price: annual }).eq("type", "annual");

  return NextResponse.redirect("/admin");
}
