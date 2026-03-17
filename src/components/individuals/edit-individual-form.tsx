"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateIndividual } from "@/app/(app)/individuals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Individual {
  id: string;
  display_name: string;
  date_of_birth: string | null;
  allergies: string | null;
  medical_notes: string | null;
  subscription_active?: boolean;
  subscription_type?: string;
  subscription_expiry?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relation: string | null;
  phone: string;
}

export function EditIndividualForm({
  individual,
  contact,
}: {
  individual: Individual;
  contact: EmergencyContact;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          updateIndividual(individual.id, formData).then((res) => {
            if (!res.ok) return toast.error(res.message);
            toast.success("Individual updated");
            router.push(`/individuals/${individual.id}`);
          });
        });
      }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="display_name">Full Name *</Label>
        <Input
          id="display_name"
          name="display_name"
          placeholder="e.g., John Doe"
          defaultValue={individual.display_name}
          required
          disabled={isPending}
        />
      </div>

      {/* Admin Subscription Controls */}
      <div className="space-y-2 border p-4 rounded">
        <div className="font-semibold">Subscription Controls (Admin)</div>
        <div className="flex gap-2 items-center">
          <Label htmlFor="subscription_active">Active</Label>
          <Input
            id="subscription_active"
            name="subscription_active"
            type="checkbox"
            defaultChecked={!!individual.subscription_active}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subscription_type">Type</Label>
          <select
            id="subscription_type"
            name="subscription_type"
            defaultValue={individual.subscription_type || 'monthly'}
            disabled={isPending}
            className="border rounded px-2 py-1"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subscription_expiry">Expiry</Label>
          <Input
            id="subscription_expiry"
            name="subscription_expiry"
            type="date"
            defaultValue={individual.subscription_expiry || ''}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          defaultValue={individual.date_of_birth ?? ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          name="allergies"
          placeholder="e.g., Peanuts, Penicillin"
          defaultValue={individual.allergies ?? ""}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical_notes">Medical Notes</Label>
        <Textarea
          id="medical_notes"
          name="medical_notes"
          placeholder="e.g., Diabetic, Asthmatic"
          defaultValue={individual.medical_notes ?? ""}
          disabled={isPending}
        />
      </div>

      <div className="border-t pt-6">
        <div className="mb-4 text-sm font-semibold">Primary Emergency Contact</div>

        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name *</Label>
          <Input
            id="contact_name"
            name="contact_name"
            placeholder="e.g., Jane Doe"
            defaultValue={contact.name}
            required
            disabled={isPending}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="contact_relation">Relation</Label>
          <Input
            id="contact_relation"
            name="contact_relation"
            placeholder="e.g., Parent, Spouse"
            defaultValue={contact.relation ?? ""}
            disabled={isPending}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="contact_phone">Phone Number *</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            placeholder="e.g., +1 (555) 123-4567"
            defaultValue={contact.phone}
            required
            disabled={isPending}
          />
        </div>
      </div>


      <div className="flex gap-2 mt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="bg-slate-200 text-slate-900 hover:bg-slate-300"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
