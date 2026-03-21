
"use client";
import React, { useState } from "react";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createIndividual } from "@/app/(app)/individuals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateIndividualForm() {
  const [pending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      action={(fd) => {
        startTransition(() => {
          createIndividual(fd).then((res) => {
            if (!res.ok) {
              setNotification(res.message ?? "An error occurred");
              toast.error(res.message ?? "An error occurred");
              return;
            }
            setNotification("Profile created successfully.");
            toast.success("Profile created successfully.");
            router.push(`/individuals/${res.id}`);
            router.refresh();
          });
        });
            {notification && (
              <div className="text-green-600 font-semibold mb-2">{notification}</div>
            )}
      }}
    >
      <div className="space-y-2">
        <Label>Display name</Label>
        <Input name="display_name" placeholder="e.g., Aarav K." required />
      </div>

      <div className="space-y-2">
        <Label>Date of birth (optional)</Label>
        <Input name="date_of_birth" type="date" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Allergies (optional)</Label>
        <Input name="allergies" placeholder="e.g., Peanuts, Penicillin" />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Medical notes (optional)</Label>
        <Textarea name="medical_notes" placeholder="Short and emergency-relevant only." />
      </div>

      <div className="space-y-2">
        <Label>Emergency contact name</Label>
        <Input name="contact_name" placeholder="e.g., Mom" required />
      </div>

      <div className="space-y-2">
        <Label>Relation (optional)</Label>
        <Input name="contact_relation" placeholder="Mother / Father / Guardian" />
      </div>


      <div className="space-y-2 md:col-span-2">
        <Label>Phone</Label>
        <Input name="contact_phone" placeholder="+61 ..." required />
      </div>


      <div className="md:col-span-2">
        <Button disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
