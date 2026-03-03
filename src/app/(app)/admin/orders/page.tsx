
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { OrdersTable } from "./orders-table";
import { AdminTabs } from "@/components/admin/admin-tabs";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  // Auth/admin check with supabaseServer
  const supabaseSession = await supabaseServer();
  const { data: auth } = await supabaseSession.auth.getUser();
  if (!auth.user) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Access Denied</div>
        <div className="text-muted-foreground">You must be logged in to access this page.</div>
        <Link href="/login"><button className="btn">Go to Login</button></Link>
      </div>
    );
  }

  // Check if user is admin
  const { data: guardian } = await supabaseSession
    .from("guardians")
    .select("is_admin")
    .eq("id", auth.user.id)
    .single();

  if (!guardian?.is_admin) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Access Denied</div>
        <div className="text-muted-foreground">You do not have admin privileges to access this page.</div>
        <Link href="/dashboard"><button className="btn">Go to Dashboard</button></Link>
      </div>
    );
  }

  // Fetch all orders with individual and guardian info using supabaseAdmin
  const supabase = supabaseAdmin();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      created_at,
      individual_id,
      guardian_id,
      product:product_id(name, type, description),
      individual:individual_id(display_name, public_id),
      guardian:guardian_id(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Error</div>
        <div className="text-muted-foreground">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminTabs active="orders" />
      <div>
        <div className="text-2xl font-bold">Order Management</div>
        <div className="text-muted-foreground">View and manage all orders placed by users.</div>
      </div>
      <OrdersTable orders={orders || []} />
    </div>
  );
}
