"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminQrDownloadButton } from "@/components/admin/admin-qr-download-button";
import { RegenerateQrButton } from "@/components/admin/regenerate-qr-button";

export function QrCodesTable({ guardians, qrAssets }: { guardians: any[]; qrAssets: any[] }) {
  const [search, setSearch] = React.useState("");
  const qrMap = new Map((qrAssets || []).map((qa: any) => [qa.individual_id, qa]));
  const filteredGuardians = (guardians ?? []).map((g: any) => ({
    ...g,
    individuals: (g.individuals ?? []).filter((ind: any) => {
      const q = search.toLowerCase();
      return (
        g.full_name?.toLowerCase().includes(q) ||
        g.email?.toLowerCase().includes(q) ||
        g.phone?.toLowerCase().includes(q) ||
        ind.display_name?.toLowerCase().includes(q) ||
        ind.public_id?.toLowerCase().includes(q)
      );
    })
  })).filter((g: any) => g.individuals.length > 0 || g.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="p-6">
      <input
        className="mb-4 w-full border rounded px-3 py-2"
        placeholder="Search by guardian, individual, email, phone, or public ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="font-semibold mb-4">All Guardians, Individuals & QR Codes</div>
      <div className="space-y-2">
        {filteredGuardians.length === 0 ? (
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
                  <th className="text-left py-2 px-2">QR Status</th>
                  <th className="text-left py-2 px-2">Download</th>
                  <th className="text-left py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuardians.map((guardian: any) => {
                  if (!guardian.individuals || guardian.individuals.length === 0) {
                    return (
                      <tr key={guardian.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{guardian.full_name}</td>
                        <td className="py-2 px-2">{guardian.email || "—"}</td>
                        <td className="py-2 px-2">{guardian.phone || "—"}</td>
                        <td className="py-2 px-2" colSpan={5}>
                          <span className="text-muted-foreground">No individuals</span>
                        </td>
                      </tr>
                    );
                  }
                  return guardian.individuals.map((indiv: any) => {
                    const qrAsset = qrMap.get(indiv.id);
                    const hasQr = !!qrAsset;
                    return (
                      <tr key={indiv.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{guardian.full_name}</td>
                        <td className="py-2 px-2">{guardian.email || "—"}</td>
                        <td className="py-2 px-2">{guardian.phone || "—"}</td>
                        <td className="py-2 px-2">{indiv.display_name}</td>
                        <td className="py-2 px-2 font-mono text-xs">{indiv.public_id.slice(0, 8)}...</td>
                        <td className="py-2 px-2">
                          {hasQr ? (
                            <span className="text-green-600 font-medium">✓ Generated</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Missing</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {hasQr ? (
                            <AdminQrDownloadButton individualId={indiv.id} individualName={indiv.display_name} />
                          ) : (
                            <Button disabled className="text-xs">No QR</Button>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {hasQr ? (
                            <RegenerateQrButton individualId={indiv.id} individualName={indiv.display_name} />
                          ) : (
                            <Button disabled className="text-xs">No QR</Button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
