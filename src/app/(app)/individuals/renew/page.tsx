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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching individual for renew page", individual_id);
        const indivRes = await fetch(`/api/individuals/${individual_id}`);
        if (!indivRes.ok) {
          const errText = await indivRes.text();
          throw new Error(`Failed to fetch individual details. Status: ${indivRes.status}. Response: ${errText}`);
        }
        const indivData = await indivRes.json();
        if (!indivData.individual) {
          throw new Error("No individual found for the given ID.");
        }
        setIndiv(indivData.individual);
        const priceRes = await fetch("/api/subscription-prices");
        if (!priceRes.ok) throw new Error("Failed to fetch subscription prices.");
        const priceData = await priceRes.json();
        const priceMap: { [key: string]: number } = {};
        (priceData.prices || []).forEach((p: any) => { priceMap[p.type] = p.price; });
        setPrices(priceMap);
      } catch (err: any) {
        console.error("Renew subscription fetch error", err);
        setError((err && err.message) ? err.message : "An error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [individual_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <div className="text-lg">Loading subscription details...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="text-2xl font-bold text-red-600">Error</div>
        <div className="text-muted-foreground">{error}</div>
        <Link href="/individuals"><Button variant="outline">Back</Button></Link>
      </div>
    );
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
            setError(null);
            try {
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const res = await fetch("/api/subscription-renew", {
                method: "POST",
                body: fd,
              });
              const data = await res.json();
              if (data.success) {
                setNotification("Subscription renewed successfully.");
              } else {
                setError(data.error || "Failed to renew subscription.");
              }
            } catch (err: any) {
              setError(err.message || "Failed to renew subscription.");
            } finally {
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
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-2 text-sm mb-2">
            <b>Payment integration coming soon.</b> This is a demo renewal. No payment will be processed.
          </div>
          {error && <div className="text-red-600 text-sm font-semibold mb-2">{error}</div>}
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={pending} loading={pending}>
            {pending ? "Processing..." : "Pay & Renew"}
          </Button>
        </form>
        <Link href="/individuals"><Button variant="outline" className="w-full">Cancel</Button></Link>
      </Card>
    </main>
  );
}
