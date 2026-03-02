import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-bold">Dashboard</div>
          <div className="text-muted-foreground">
            {user?.email ? `Welcome back, ${user.email}` : "Welcome!"}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <NotificationDropdown />
          <Link href="/individuals"><Button>Manage individuals</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Phase</div>
          <div className="mt-1 text-xl font-semibold">QR Profiles</div>
          <Badge className="mt-3 w-fit" variant="secondary">Live</Badge>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Next</div>
          <div className="mt-1 text-xl font-semibold">Tracking Devices</div>
          <Badge className="mt-3 w-fit" variant="outline">Planned</Badge>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Later</div>
          <div className="mt-1 text-xl font-semibold">Mobile App</div>
          <Badge className="mt-3 w-fit" variant="outline">Planned</Badge>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Recent individuals</div>
            <div className="text-sm text-muted-foreground">Quick access to latest profiles.</div>
          </div>
          <Link href="/individuals"><Button variant="outline">View all</Button></Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(individuals ?? []).map((i) => (
            <Link key={i.id} href={`/individuals/${i.id}`}>
              <Card className="p-4 hover:bg-muted/20 transition">
                <div className="font-medium">{i.display_name}</div>
                <div className="mt-1 text-xs text-muted-foreground">/p/{i.public_id}</div>
              </Card>
            </Link>
          ))}
          {(individuals ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">
              No individuals yet. Add your first one from Individuals.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
