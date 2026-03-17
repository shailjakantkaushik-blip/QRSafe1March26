import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">Pricing</div>
          <div className="text-muted-foreground">
            Subscription per individual profile (Phase 1).
          </div>
        </div>
        <Link href="/"><Button variant="outline">Back</Button></Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <Badge className="w-fit" variant="secondary">Monthly</Badge>
          <div className="mt-3 text-4xl font-bold">$8</div>
          <div className="text-sm text-muted-foreground">per individual / month</div>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Public emergency profile</li>
            <li>• Allergies & medical notes</li>
            <li>• Multiple emergency contacts</li>
            <li>• QR generation + download</li>
          </ul>
          <Link href="/shop"><Button className="mt-6 w-full">Choose monthly</Button></Link>
        </Card>

        <Card className="p-6">
          <Badge className="w-fit" variant="secondary">Quarterly</Badge>
          <div className="mt-3 text-4xl font-bold">$22</div>
          <div className="text-sm text-muted-foreground">per individual / quarter</div>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Everything in Monthly</li>
            <li>• Save 8%</li>
          </ul>
          <Link href="/shop"><Button className="mt-6 w-full" variant="outline">Choose quarterly</Button></Link>
        </Card>

        <Card className="p-6">
          <Badge className="w-fit" variant="secondary">Yearly</Badge>
          <div className="mt-3 text-4xl font-bold">$80</div>
          <div className="text-sm text-muted-foreground">per individual / year</div>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Everything in Monthly</li>
            <li>• Best value for families</li>
            <li>• Save 17%</li>
          </ul>
          <Link href="/shop"><Button className="mt-6 w-full" variant="outline">Choose yearly</Button></Link>
        </Card>
      </div>
    </main>
  );
}
