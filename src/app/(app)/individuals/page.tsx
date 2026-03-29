import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import CreateIndividualForm from "@/components/individuals/create-individual-form";
import Link from "next/link";
import { getOrderStatsForIndividuals } from "./order-stats";


export default async function IndividualsPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const guardianId = auth.user?.id;
  const { data: individuals } = await supabase
    .from("individuals")
    .select("id, display_name, public_id, created_at, guardian_id")
    .eq("guardian_id", guardianId)
    .order("created_at", { ascending: false });

  const stats = await getOrderStatsForIndividuals((individuals ?? []).map((i) => i.id));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Individuals</div>
        <div className="text-muted-foreground">Add and manage profiles. Each profile has its own QR code.</div>
      </div>


      <Card className="p-6">
        <div className="font-semibold">Add a new individual</div>
        <div className="text-sm text-muted-foreground">Keep it minimal for emergencies.</div>
        <div className="mt-4">
          <CreateIndividualForm />
        </div>
        <div className="mt-6">
          <Link href="/shop">
            <button className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 w-full">
              Shop QR Products (select individual)
            </button>
          </Link>
          <div className="text-xs text-muted-foreground mt-2">
            You will be asked to select which individual the product is for.
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="font-semibold">All individuals</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(individuals ?? []).map((i) => {
            const stat = stats?.[i.id] || { ordered: 0, delivered: 0 };
            return (
              <Link key={i.id} href={`/individuals/${i.id}`}>
                <Card className="p-4 hover:bg-muted/20 transition">
                  <div className="font-medium">{i.display_name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">/p/{i.public_id}</div>
                  <div className="mt-2 text-xs text-slate-600">
                    <span>Ordered: <b>{stat.ordered}</b></span> &nbsp;|&nbsp; <span>Delivered: <b>{stat.delivered}</b></span>
                  </div>
                </Card>
              </Link>
            );
          })}
          {(individuals ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">Add your first individual using the form above.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
