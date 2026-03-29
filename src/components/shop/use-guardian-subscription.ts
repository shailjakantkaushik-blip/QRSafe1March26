import { useEffect, useState } from "react";

export function useGuardianSubscription() {
  const [status, setStatus] = useState<{
    active: boolean;
    type: string | null;
    expiry: string | null;
    loading: boolean;
    error: string | null;
  }>({
    active: false,
    type: null,
    expiry: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStatus() {
      setStatus(s => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch("/api/guardian-subscription-status");
        if (!res.ok) throw new Error("Failed to fetch subscription status");
        const data = await res.json();
        setStatus({
          active: !!data.subscription_active,
          type: data.subscription_type || null,
          expiry: data.subscription_expiry || null,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setStatus(s => ({ ...s, loading: false, error: err.message || "Error" }));
      }
    }
    fetchStatus();
  }, []);

  return status;
}
