import { NextApiRequest, NextApiResponse } from "next";
import { supabaseServer } from "@/lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing id" });
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("individuals")
    .select("id, display_name, subscription_type, subscription_expiry, subscription_active")
    .eq("id", id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  return res.status(200).json({ individual: data });
}
