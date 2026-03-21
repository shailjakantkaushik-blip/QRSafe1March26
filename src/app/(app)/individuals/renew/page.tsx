"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RenewSubscriptionPage({ searchParams }: { searchParams: { individual_id: string, subscription_type?: string } }) {
  const { individual_id, subscription_type = "monthly" } = searchParams;
  const [indiv, setIndiv] = useState<any>(null);
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [selectedType, setSelectedType] = useState(subscription_type);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const indivRes = await fetch(`/api/individuals/${individual_id}`);
      const indivData = await indivRes.json();
      setIndiv(indivData.individual);
      const priceRes = await fetch("/api/subscription-prices");
      const priceData = await priceRes.json();
      const priceMap: { [key: string]: number } = {};
      (priceData.prices || []).forEach((p: any) => { priceMap[p.type] = p.price; });
      setPrices(priceMap);
      setLoading(false);
    }
    fetchData();
  }, [individual_id]);

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading...</div>;
  }
  if (!indiv) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Not found</div>
        <div className="text-muted-foreground">Invalid individual ID</div>
        <Link href="/individuals"><Button>Back</Button></Link>
      </div>
    );
  }

  const price = prices[selectedType] ?? 0;

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Card className="p-6 space-y-6">
        <div className="text-2xl font-bold mb-2">Renew Subscription</div>
        <div className="text-lg font-semibold">{indiv.display_name}</div>
        <div className="text-sm text-muted-foreground">
          Current status: {indiv.subscription_active ? "Active" : "Inactive"}<br />
          Current expiry: {indiv.subscription_expiry ? new Date(indiv.subscription_expiry).toLocaleDateString() : "—"}
        </div>
        {notification && (
          <div className="text-green-600 font-semibold mb-2">{notification}</div>
        )}
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setNotification(null);
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const res = await fetch("/api/subscription-renew", {
              method: "POST",
              body: fd,
            });
            const data = await res.json();
            if (data.success) {
              setNotification("Subscription renewed successfully.");
              setPending(false);
            } else {
              setNotification(data.error || "Failed to renew subscription.");
              setPending(false);
            }
          }}
        >
          <input type="hidden" name="individual_id" value={indiv.id} />
          <label className="block text-sm font-medium mb-1">Subscription Type</label>
          <select
            name="subscription_type"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="border rounded px-2 py-1 w-full mb-2"
            disabled={pending}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
          <div className="text-lg font-bold">Amount: ${price}</div>
          {/* Payment gateway integration will go here */}
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={pending}>
            {pending ? "Processing..." : "Pay & Renew"}
          </Button>
        </form>
        <Link href="/individuals"><Button variant="outline" className="w-full">Cancel</Button></Link>
      </Card>
    </main>
  );
}
