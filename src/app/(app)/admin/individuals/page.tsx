import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminIndividualsPage() {
  const supabase = supabaseAdmin();
  const { data: guardians, error: guardianError } = await supabase
    .from("guardians")
    .select(`
      id,
      full_name,
      email,
      phone,
      individuals:individuals(id, display_name, public_id, created_at)
    `)
    .order("full_name", { ascending: true });

  if (guardianError || !guardians) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold">Error</div>
        <div className="text-muted-foreground">{guardianError?.message || "Failed to load guardians"}</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminTabs active="individuals" />
      <div className="flex-1 p-8">
        <div className="text-2xl font-bold mb-4">Individuals & Guardians Management</div>
        <input
          className="mb-4 w-full border rounded px-3 py-2"
          placeholder="Search by guardian, individual, email, phone, or public ID..."
          // TODO: Add search logic
        />
        <Card className="p-6">
          <div className="font-semibold mb-4">All Guardians & Individuals</div>
          <div className="space-y-2">
            {guardians.length === 0 ? (
              <div className="text-sm text-muted-foreground">No guardians found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Guardian Name</th>
                      <th className="text-left py-2 px-2">Guardian Email</th>
                      <th className="text-left py-2 px-2">Guardian Phone</th>
                      <th className="text-left py-2 px-2">Individual</th>
                      <th className="text-left py-2 px-2">Public ID</th>
                      <th className="text-left py-2 px-2">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardians.map((guardian: any) => {
                      if (!guardian.individuals || guardian.individuals.length === 0) {
                        return (
                          <tr key={guardian.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">{guardian.full_name}</td>
                            <td className="py-2 px-2">{guardian.email || "—"}</td>
                            <td className="py-2 px-2">{guardian.phone || "—"}</td>
                            <td className="py-2 px-2" colSpan={3}>
                              <span className="text-muted-foreground">No individuals</span>
                            </td>
                          </tr>
                        );
                      }
                      return guardian.individuals.map((indiv: any) => (
                        <tr key={indiv.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">{guardian.full_name}</td>
                          <td className="py-2 px-2">{guardian.email || "—"}</td>
                          <td className="py-2 px-2">{guardian.phone || "—"}</td>
                          <td className="py-2 px-2">{indiv.display_name}</td>
                          <td className="py-2 px-2 font-mono text-xs">{indiv.public_id.slice(0, 8)}...</td>
                          <td className="py-2 px-2">
                            <Link href={`/individuals/${indiv.id}/edit`}><Button className="bg-blue-600 hover:bg-blue-700 text-white">Edit</Button></Link>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
