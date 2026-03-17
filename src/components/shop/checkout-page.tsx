"use client";
import React, { useState } from "react";
import { useCart } from "./cart-context";
import { useGuardianId } from "./use-guardian-id";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const guardianId = useGuardianId();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    subscriptionType: "monthly",
  });
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Subscription prices state
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  // Fetch prices on mount
  React.useEffect(() => {
    fetch("/api/subscription-prices")
      .then(res => res.json())
      .then(data => {
        const priceMap: { [key: string]: number } = {};
        (data.prices || []).forEach((p: any) => { priceMap[p.type] = Number(p.price); });
        setPrices(priceMap);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      // Persist order to DB
      // Attach guardian_id (UUID) and subscriptionType to each item
      const itemsWithGuardian = items.map(item => ({ ...item, guardian_id: guardianId, subscriptionType: form.subscriptionType }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsWithGuardian, shipping: form }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Order failed");
      // TODO: Integrate with Stripe checkout session here
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Checkout failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {items.length === 0 && !success ? (
        <div className="text-muted-foreground">Your cart is empty.</div>
      ) : success ? (
        <div className="text-green-600 font-semibold">Order placed successfully! Thank you.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="font-semibold mb-2">Shipping Information</div>
            <div className="grid gap-3">
              <input className="border rounded px-3 py-2" name="name" placeholder="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="border rounded px-3 py-2" name="email" type="email" placeholder="Email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="border rounded px-3 py-2" name="address" placeholder="Shipping Address" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <input className="border rounded px-3 py-2" name="city" placeholder="City" required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              <input className="border rounded px-3 py-2" name="zip" placeholder="ZIP / Postal Code" required value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
              <input className="border rounded px-3 py-2" name="country" placeholder="Country" required value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              {/* Subscription Period Selection */}
              <div className="border rounded p-3 bg-slate-50">
                <label htmlFor="subscriptionType" className="block text-base font-semibold mb-2 text-slate-700">Select Subscription Period <span className="text-red-600">*</span></label>
                <select
                  id="subscriptionType"
                  name="subscriptionType"
                  value={form.subscriptionType}
                  onChange={e => setForm(f => ({ ...f, subscriptionType: e.target.value }))}
                  className="border rounded px-2 py-2 text-lg"
                  required
                >
                  <option value="" disabled>Select period</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="font-semibold mb-2">Order Summary</div>
            <ul className="mb-2">
              {items.map((item) => (
                <li key={item.productId} className="text-sm flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            {/* Subscription Cost Breakdown */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-1">Subscription Cost</div>
              <div className="flex justify-between text-sm">
                <span>{form.subscriptionType.charAt(0).toUpperCase() + form.subscriptionType.slice(1)} QR Subscription</span>
                <span>
                  {prices[form.subscriptionType] !== undefined ? `$${prices[form.subscriptionType]}` : "—"}
                </span>
              </div>
            </div>
            {/* Product Cost Breakdown */}
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Product Cost</div>
              <div className="flex justify-between text-sm">
                <span>QR Product(s)</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="font-bold text-base mt-4">Total: {
              prices[form.subscriptionType] !== undefined ? (prices[form.subscriptionType] + total) : total
            }$</div>
          </Card>
          <Button className="w-full" type="submit" disabled={pending}>{pending ? "Placing Order..." : "Place Order & Pay"}</Button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
