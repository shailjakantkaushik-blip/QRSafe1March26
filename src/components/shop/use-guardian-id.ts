"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function useGuardianId() {
  const [guardianId, setGuardianId] = useState<string | null>(null);
  useEffect(() => {
    async function getUser() {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.getUser();
      if (data?.user?.id) setGuardianId(data.user.id);
    }
    getUser();
  }, []);
  return guardianId;
}
