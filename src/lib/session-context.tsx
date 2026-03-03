"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export const SessionContext = createContext<{ user: any | null }>({ user: null });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = supabaseBrowser();
        const { data: auth, error } = await supabase.auth.getUser();
        if (error && error.message && error.message.includes("Invalid Refresh Token")) {
          // Redirect to login if refresh token is invalid
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }
        setUser(auth.user || null);
        if (auth.user && typeof window !== "undefined") {
          // Set guardian_id in localStorage
          localStorage.setItem("guardian_id", auth.user.id);
        }
      } catch (e) {
        // Fallback: redirect to login on any unexpected error
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    fetchUser();
  }, []);

  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
