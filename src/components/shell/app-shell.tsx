"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QrCode, LayoutDashboard, Users, LogOut, Shield } from "lucide-react";
import { LogoutButton } from "@/components/shell/logout-button";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    async function fetchAdmin() {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data: guardian } = await supabase
        .from("guardians")
        .select("is_admin")
        .eq("id", auth.user.id)
        .maybeSingle();
      setIsAdmin(guardian?.is_admin === true);
    }
    fetchAdmin();
  }, []);
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-r bg-muted/10 p-4 md:min-h-screen">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <QrCode className="h-5 w-5" />
            </span>
            SafeQR
          </Link>

          <Separator className="my-4" />

          <nav className="space-y-2">
            <Link href="/dashboard" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/individuals" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Individuals
              </Button>
            </Link>
            <Link href="/shop" className="block">
              <div className="w-full flex items-center justify-start gap-2">
                <span className="h-4 w-4 inline-block">
                  {/* Cart icon with badge */}
                  {typeof window !== 'undefined' &&
                    require("@/components/shop/cart-icon-badge").CartIconWithBadge({})}
                </span>
                <span className="ml-2">Shop</span>
              </div>
            </Link>
            <Link href="/guardian-info" className="block">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Guardian Info
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin/qr-codes" className="block">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    QR Management
                  </Button>
                </Link>
                <Link href="/admin/products" className="block">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <span className="h-4 w-4 inline-block">📦</span>
                    Admin Products
                  </Button>
                </Link>
              </>
            )}
          </nav>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
