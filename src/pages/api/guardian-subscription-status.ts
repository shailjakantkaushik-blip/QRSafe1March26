import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get current user (guardian) from session
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  // Fetch guardian's subscription status
  const { data, error } = await supabase
    .from("individuals")
    .select("subscription_active, subscription_type, subscription_expiry")
    .eq("guardian_id", user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "No subscription found" });
  return res.status(200).json(data);
}
