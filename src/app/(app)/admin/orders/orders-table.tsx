"use client";
import React from "react";
import { Card } from "@/components/ui/card";

export function OrdersTable({ orders }: { orders: any[] }) {
  const [search, setSearch] = React.useState("");
  const filteredOrders = (orders ?? []).filter((order: any) => {
    const q = search.toLowerCase();
    return (
      order.id?.toLowerCase().includes(q) ||
      order.individual?.display_name?.toLowerCase().includes(q) ||
      order.guardian?.full_name?.toLowerCase().includes(q) ||
      order.guardian_id?.toLowerCase().includes(q)
    );
  });

  return (
    <Card className="p-6">
      <input
        className="mb-4 w-full border rounded px-3 py-2"
        placeholder="Search by order, individual, guardian, or ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="font-semibold mb-4">All Orders</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2 px-2">Order ID</th>
              <th className="text-left py-2 px-2">Individual Name</th>
              <th className="text-left py-2 px-2">Guardian Name</th>
              <th className="text-left py-2 px-2">Guardian ID</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="border-b hover:bg-muted/50">
                <td className="py-2 px-2 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                <td className="py-2 px-2">{order.individual?.display_name || "—"}</td>
                <td className="py-2 px-2">{order.guardian?.full_name || "—"}</td>
                <td className="py-2 px-2 font-mono text-xs">{order.guardian_id || "—"}</td>
                <td className="py-2 px-2">{order.status || "—"}</td>
                <td className="py-2 px-2">{new Date(order.created_at).toISOString().replace('T', ' ').slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
