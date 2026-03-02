"use client";
import Link from "next/link";
import AuthCard from "@/components/auth/auth-card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <div className="text-2xl font-bold">Welcome back</div>
          <div className="text-muted-foreground">Log in to manage your profiles.</div>
        </div>
        <AuthCard mode="login" />
        <div className="text-sm text-muted-foreground">
          New here? <Link className="underline" href="/signup">Create an account</Link>
        </div>
      </div>
    </main>
  );
}
