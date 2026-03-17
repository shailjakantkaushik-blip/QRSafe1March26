"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Table } from "../ui/table";

interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  price?: number;
}

export default function ProductCrud() {
    // Subscription prices state
    const [prices, setPrices] = useState<{ [key: string]: number }>({});
    useEffect(() => {
      fetch("/api/subscription-prices")
        .then(res => res.json())
        .then(data => {
          const priceMap: { [key: string]: number } = {};
          (data.prices || []).forEach((p: any) => { priceMap[p.type] = Number(p.price); });
          setPrices(priceMap);
        });
    }, []);

    const [priceForm, setPriceForm] = useState({
      monthly: prices.monthly ?? 8,
      quarterly: prices.quarterly ?? 22,
      annual: prices.annual ?? 80,
    });
    useEffect(() => {
      setPriceForm({
        monthly: prices.monthly ?? 8,
        quarterly: prices.quarterly ?? 22,
        annual: prices.annual ?? 80,
      });
    }, [prices]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPriceForm({ ...priceForm, [e.target.name]: Number(e.target.value) });
    };

    const handlePriceSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await fetch("/api/admin/update-subscription-prices", {
        method: "POST",
        body: new FormData(e.target as HTMLFormElement),
      });
      // Refetch prices
      fetch("/api/subscription-prices")
        .then(res => res.json())
        .then(data => {
          const priceMap: { [key: string]: number } = {};
          (data.prices || []).forEach((p: any) => { priceMap[p.type] = Number(p.price); });
          setPrices(priceMap);
        });
    };
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    // Only send updatable fields, not id
    const payload: any = {
      name: form.name,
      type: form.type,
      description: form.description,
      price: form.price !== undefined ? Number(form.price) : undefined,
    };
    let response;
    // UUID v4 regex (simple, not strict)
    const isValidUUID = (id: string | null) =>
      typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id);

    try {
      if (isValidUUID(editingId)) {
        response = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!response.ok) {
        const err = await response.json();
        // Log error details for debugging
        // eslint-disable-next-line no-console
        console.error("ProductCrud[handleSubmit] error", {
          editingId,
          payload,
          status: response.status,
          err,
        });
        setError(
          `Error: ${err.error || "Unknown error"} (status: ${response.status})\n` +
          `editingId: ${editingId}\n` +
          `payload: ${JSON.stringify(payload)}`
        );
        setPending(false);
        return;
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("ProductCrud[handleSubmit] unexpected error", err);
      setError(`Unexpected error: ${err.message || err}`);
      setPending(false);
      return;
    }
    setForm({});
    setEditingId(null);
    setPending(false);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      });
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    // Only set editingId if valid UUID
    if (typeof product.id === "string" && /^[0-9a-fA-F-]{36}$/.test(product.id)) {
      setEditingId(product.id);
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      });
    // If deleting the currently edited product, reset form
    if (editingId === id) {
      setForm({});
      setEditingId(null);
    }
  };

  return (
    <Card className="p-8 shadow-lg border border-gray-200">
      {/* Subscription Rate Management */}
      <form onSubmit={handlePriceSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="monthly_price" className="block text-xs font-semibold mb-1 text-gray-600">Monthly Price ($)</label>
          <Input id="monthly_price" name="monthly_price" type="number" step="0.01" min="0" value={priceForm.monthly} onChange={handlePriceChange} required />
        </div>
        <div>
          <label htmlFor="quarterly_price" className="block text-xs font-semibold mb-1 text-gray-600">Quarterly Price ($)</label>
          <Input id="quarterly_price" name="quarterly_price" type="number" step="0.01" min="0" value={priceForm.quarterly} onChange={handlePriceChange} required />
        </div>
        <div>
          <label htmlFor="annual_price" className="block text-xs font-semibold mb-1 text-gray-600">Annual Price ($)</label>
          <Input id="annual_price" name="annual_price" type="number" step="0.01" min="0" value={priceForm.annual} onChange={handlePriceChange} required />
        </div>
        <div className="md:col-span-3 mt-4">
          <Button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700">Save Prices</Button>
        </div>
      </form>
      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label htmlFor="product-name" className="block text-xs font-semibold mb-1 text-gray-600">Name</label>
          <Input id="product-name" name="name" placeholder="Name" value={form.name || ""} onChange={handleChange} required autoComplete="off" />
        </div>
        <div>
          <label htmlFor="product-type" className="block text-xs font-semibold mb-1 text-gray-600">Type</label>
          <Input id="product-type" name="type" placeholder="Type" value={form.type || ""} onChange={e => setForm({ ...form, type: e.target.value })} required autoComplete="off" />
        </div>
        <div>
          <label htmlFor="product-description" className="block text-xs font-semibold mb-1 text-gray-600">Description</label>
          <Input id="product-description" name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} required autoComplete="off" />
        </div>
        <div>
          <label htmlFor="product-price" className="block text-xs font-semibold mb-1 text-gray-600">Price</label>
          <Input id="product-price" name="price" type="number" step="0.01" placeholder="Price" value={form.price ?? ""} onChange={handleChange} required autoComplete="off" />
        </div>
        <Button type="submit" className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded" disabled={pending}>
          {pending ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update" : "Add") } Product
        </Button>
        {error && <div className="col-span-full text-red-600 text-sm mt-2">{error}</div>}
      </form>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product, idx) => (
              <tr key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 whitespace-nowrap">{product.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{product.type}</td>
                <td className="px-4 py-2 whitespace-nowrap">{product.description}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right font-mono">{product.price !== undefined ? `$${Number(product.price).toFixed(2)}` : "—"}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <Button variant="outline" onClick={() => handleEdit(product)} className="mr-2">Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(product.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
