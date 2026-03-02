"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  fullName: z.string().min(2, "Enter your full name").optional(),
  phone: z.string().min(8, "Enter a valid phone number").optional(),
});

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = supabaseBrowser();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const fullName = String(formData.get("fullName") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();

      const parsed = schema.safeParse({
        email,
        password,
        fullName: mode === "signup" ? fullName : undefined,
        phone: mode === "signup" ? phone : undefined,
      });

      if (!parsed.success) {
        // Notification logic removed
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/dashboard`
                : undefined,
          },
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // Immediately upsert guardian info if user is returned
        if (data?.user) {
          await fetch("/api/ensure-guardian-on-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || fullName,
              phone: data.user.user_metadata?.phone || phone,
            }),
          });
        }

        setMessage("Signup successful! Please check your email for verification or login.");
        setErrorMsg(null);
        // Optionally, redirect after a short delay
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1500);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // After successful login, upsert guardian info (first login only)
        // Get user info from session
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Call API to upsert guardian info
          await fetch("/api/ensure-guardian-on-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "",
              phone: user.user_metadata?.phone || "",
            }),
          });
        }
        // Use full reload to ensure server sees new cookie
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      {message && <div className="text-green-600 text-sm mb-2">{message}</div>}
      {errorMsg && <div className="text-red-600 text-sm mb-2">{errorMsg}</div>}
      <form action={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="e.g. +1234567890" required />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            required
          />
        </div>

        <Button className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
