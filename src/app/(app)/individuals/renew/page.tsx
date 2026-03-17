import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RenewSubscriptionPage({ searchParams }: { searchParams: { individual_id: string, subscription_type?: string } }) {
  const { individual_id, subscription_type = "monthly" } = searchParams;
  const supabase = await supabaseServer();
  const { data: indiv, error } = await supabase
    .from("individuals")
    .select("id, display_name, subscription_type, subscription_expiry, subscription_active")
    .eq("id", individual_id)
    .single();

  if (error || !indiv) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Not found</div>
        <div className="text-muted-foreground">Invalid individual ID</div>
        <Link href="/individuals"><Button>Back</Button></Link>
      </div>
    );
  }

  // TODO: Fetch price from subscription_prices table
  const price = subscription_type === "annual" ? 100 : subscription_type === "quarterly" ? 30 : 12; // Placeholder

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Card className="p-6 space-y-6">
        <div className="text-2xl font-bold mb-2">Renew Subscription</div>
        <div className="text-lg font-semibold">{indiv.display_name}</div>
        <div className="text-sm text-muted-foreground">
          Current status: {indiv.subscription_active ? "Active" : "Inactive"}<br />
          Current expiry: {indiv.subscription_expiry ? new Date(indiv.subscription_expiry).toLocaleDateString() : "—"}
        </div>
        <form action="/api/subscription-renew" method="POST" className="space-y-4">
          <input type="hidden" name="individual_id" value={indiv.id} />
          <label className="block text-sm font-medium mb-1">Subscription Type</label>
          <select name="subscription_type" defaultValue={subscription_type} className="border rounded px-2 py-1 w-full mb-2">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
          <div className="text-lg font-bold">Amount: ${price}</div>
          {/* Payment gateway integration will go here */}
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Pay & Renew</Button>
        </form>
        <Link href="/individuals"><Button variant="outline" className="w-full">Cancel</Button></Link>
      </Card>
    </main>
  );
}
