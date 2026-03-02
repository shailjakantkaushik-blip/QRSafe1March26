"use client";
import { useCart } from "./cart-context";
import { useGuardianId } from "./use-guardian-id";
import { useState } from "react";
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
  });
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      // Persist order to DB
      // Attach guardian_id (UUID) to each item, always use UUIDs for all references
      const itemsWithGuardian = items.map(item => ({ ...item, guardian_id: guardianId }));
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
            <div className="font-bold text-base">Total: ${total.toFixed(2)}</div>
          </Card>
          <Button className="w-full" type="submit" disabled={pending}>{pending ? "Placing Order..." : "Place Order & Pay"}</Button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
