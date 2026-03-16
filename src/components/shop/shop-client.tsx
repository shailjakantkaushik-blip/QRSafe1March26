"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/components/shop/cart-context";
import { toast } from "react-hot-toast";

export default function ShopClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [individuals, setIndividuals] = useState<any[]>([]);
  // Always use the individual's UUID id for selection
  const [selectedIndividual, setSelectedIndividual] = useState<string>("");
  const { addToCart } = useCart();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
    fetch("/api/individuals")
      .then((res) => res.json())
      .then((data) => setIndividuals(data.individuals ?? []));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Shop Products</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Individual</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={selectedIndividual}
          onChange={e => setSelectedIndividual(e.target.value)}
        >
          <option value="">-- Select --</option>
          {individuals.map((ind: any) => (
            <option key={ind.id} value={ind.id}>{ind.display_name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(products ?? []).map((p) => (
          <Card key={p.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="text-xs text-muted-foreground mb-2">{p.type}</div>
              <div className="text-sm mb-2">{p.description}</div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-bold text-base">${p.price}</div>
              <Button
                variant="outline"
                disabled={!selectedIndividual || loadingId === p.id}
                loading={loadingId === p.id}
                onClick={async () => {
                  setLoadingId(p.id);
                  await new Promise((res) => setTimeout(res, 500)); // Simulate async
                  addToCart({ productId: p.id, name: p.name, price: Number(p.price), type: p.type, individual_id: selectedIndividual });
                  setLoadingId(null);
                  toast.success(`${p.name} added to cart!`);
                }}
              >
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
        {(products ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground">No products available.</div>
        )}
      </div>
      <div className="mt-8 text-right">
        <Link href="/cart">
          <Button>View Cart</Button>
        </Link>
      </div>
    </div>
  );
}
