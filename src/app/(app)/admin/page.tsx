import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
    const supabase = await supabaseServer();
    // Fetch subscription prices
    const { data: prices } = await supabase
      .from("subscription_prices")
      .select("type, price")
      .order("type", { ascending: true });

    // Helper to get price by type
    const getPrice = (type: string) => prices?.find((p: any) => p.type === type)?.price || "";
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user!;

  const { data: guardian } = await supabase
    .from("guardians")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!guardian?.is_admin) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-bold">Admin</div>
        <div className="text-muted-foreground">You do not have access to this page.</div>
      </div>
    );
  }

  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      {/* Subscription Price Management */}
      <Card className="p-6 mb-6">
        <div className="font-semibold mb-4">Manage QR Subscription Prices</div>
        <form action="/api/admin/update-subscription-prices" method="POST" className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="monthly_price" className="block text-xs font-semibold mb-1 text-gray-600">Monthly Price ($)</label>
            <input id="monthly_price" name="monthly_price" type="number" step="0.01" min="0" defaultValue={getPrice("monthly")} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label htmlFor="quarterly_price" className="block text-xs font-semibold mb-1 text-gray-600">Quarterly Price ($)</label>
            <input id="quarterly_price" name="quarterly_price" type="number" step="0.01" min="0" defaultValue={getPrice("quarterly")} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label htmlFor="annual_price" className="block text-xs font-semibold mb-1 text-gray-600">Annual Price ($)</label>
            <input id="annual_price" name="annual_price" type="number" step="0.01" min="0" defaultValue={getPrice("annual")} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div className="md:col-span-3 mt-4">
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700">Save Prices</button>
          </div>
        </form>
      </Card>
      <div>
        <div className="text-2xl font-bold">Admin</div>
        <div className="text-muted-foreground">Basic admin view (expand for printing workflow).</div>
      </div>

      <Card className="p-6">
        <div className="font-semibold">Recent profiles</div>
        <div className="mt-4 space-y-2 text-sm">
          {(individuals ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between">
              <span>{i.display_name}</span>
              <span className="text-muted-foreground">{typeof window !== 'undefined' ? new Date(i.created_at).toLocaleString() : ''}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
