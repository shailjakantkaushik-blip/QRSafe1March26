"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/session-context";
import { createOrder } from "../order-actions";




export default function OrderPage() {
  const { user } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch products from API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    if (!user?.id) {
      setError("You must be logged in to place an order.");
      setPending(false);
      return;
    }
    const payload = {
      guardian_id: user.id,
      productType: formData.get("productType"),
      name: formData.get("name"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      zip: formData.get("zip"),
      country: formData.get("country"),
    };
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    setPending(false);
    if (result.ok) {
      setSuccess(true);
      formRef.current?.reset();
      setSelected(null);
    } else {
      setError(result.message || "Order failed. Try again.");
    }
  }

  return (
    <main className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Order QR Product</h1>
      <form ref={formRef} onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <div className="font-semibold mb-2">Select Product Type</div>
          <div className="grid gap-4">
            {products.length === 0 && (
              <div className="text-muted-foreground">No products available.</div>
            )}
            {products.map((p) => (
              <label key={p.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${selected === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="productType"
                  value={p.id}
                  checked={selected === p.id}
                  onChange={() => setSelected(p.id)}
                  className="accent-blue-500"
                  required
                />
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{p.type}</span>
                <span className="ml-2 text-xs text-muted-foreground">{p.description}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card className="p-6 mb-6">
          <div className="font-semibold mb-2">Billing Information</div>
          <div className="grid gap-4">
            <input className="border rounded px-3 py-2" name="name" placeholder="Full Name" required />
            <input className="border rounded px-3 py-2" name="email" type="email" placeholder="Email" required />
            <input className="border rounded px-3 py-2" name="address" placeholder="Shipping Address" required />
            <input className="border rounded px-3 py-2" name="city" placeholder="City" required />
            <input className="border rounded px-3 py-2" name="zip" placeholder="ZIP / Postal Code" required />
            <input className="border rounded px-3 py-2" name="country" placeholder="Country" required />
          </div>
        </Card>
        <Button className="w-full" type="submit" disabled={!selected || pending || success}>
          {pending ? "Ordering..." : success ? "Order Placed!" : "Place Order"}
        </Button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">Order placed successfully! We will contact you soon.</div>}
      </form>
    </main>
  );
}
