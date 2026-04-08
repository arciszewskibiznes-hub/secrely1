import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: balance } = await supabase
        .from("credit_balances")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      setUser(profile);
      setCredits(balance?.balance || 0);
      setLoading(false);
    };

    load();
  }, []);

  return { user, credits, loading };
}