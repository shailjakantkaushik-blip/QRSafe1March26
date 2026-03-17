import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminTabs({ active }: { active: "qr" | "orders" }) {
  return (
    <div className="mb-6 flex gap-2 border-b pb-2">
      <Link href="/admin/qr-codes">
        <Button variant={active === "qr" ? "default" : "outline"} size="sm">QR Codes</Button>
      </Link>
      <Link href="/admin/orders">
        <Button variant={active === "orders" ? "default" : "outline"} size="sm">Orders</Button>
      </Link>
      <Link href="/admin/individuals">
        <Button variant={active === "individuals" ? "default" : "outline"} size="sm">Individuals & Guardians</Button>
      </Link>
    </div>
  );
}
