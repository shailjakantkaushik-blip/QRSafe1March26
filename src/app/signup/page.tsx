"use client";
import Link from "next/link";
import AuthCard from "@/components/auth/auth-card";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <div className="text-2xl font-bold">Create your guardian account</div>
          <div className="text-muted-foreground">
            Manage profiles, generate QR codes, and place orders (later).
          </div>
        </div>
        <AuthCard mode="signup" />
        <div className="text-sm text-muted-foreground">
          Already have an account? <Link className="underline" href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}
