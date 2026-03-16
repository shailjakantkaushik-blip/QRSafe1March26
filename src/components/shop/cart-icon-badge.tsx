"use client";
import React from "react";
import { useCart } from "@/components/shop/cart-context";

export function CartIconWithBadge({ onClick }: { onClick?: () => void }) {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center h-8 w-8 focus:outline-none"
      aria-label="View cart"
    >
      <span className="text-2xl">🛒</span>
      {count > 0 && (
        <span
          className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full border-2 border-white"
          style={{ minWidth: 18, minHeight: 18 }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
