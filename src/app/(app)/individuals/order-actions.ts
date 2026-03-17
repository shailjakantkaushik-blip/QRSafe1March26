"use server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const orderSchema = z.object({
  guardian_id: z.string().min(1),
  // individual_id: z.string().min(1), // Remove if not required
  productType: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export async function createOrder(data: {
  guardian_id: string;
  individual_id: string;
  productType: string;
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  subscriptionType?: 'monthly' | 'quarterly' | 'annual';
}) {
  const parsed = orderSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = supabaseAdmin();
  // Insert order
  const { error, data: inserted } = await supabase.from("orders").insert({
    ...parsed.data,
    status: "ordered_payment_not_finalised",
    created_at: new Date().toISOString(),
  }).select().single();
  if (error) return { ok: false, message: error.message };

  // Check subscription status for individual
  const { data: individual, error: indError } = await supabase
    .from("individuals")
    .select("subscription_active, subscription_type, subscription_expiry")
    .eq("id", data.individual_id)
    .single();
  if (indError) return { ok: false, message: indError.message };

  // If not subscribed, activate subscription
  if (!individual.subscription_active) {
    let expiry;
    const now = new Date();
    switch (data.subscriptionType) {
      case 'quarterly':
        expiry = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case 'annual':
        expiry = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        expiry = new Date(now.setMonth(now.getMonth() + 1));
        break;
    }
    const { error: subError } = await supabase
      .from("individuals")
      .update({
        subscription_active: true,
        subscription_type: data.subscriptionType || 'monthly',
        subscription_expiry: expiry.toISOString().split('T')[0],
      })
      .eq("id", data.individual_id);
    if (subError) return { ok: false, message: subError.message };
  }
  // For additional products, keep subscription unchanged
  return { ok: true, order: inserted };
}
// Update order status after payment
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
