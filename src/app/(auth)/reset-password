"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { KeyRound, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/useToast";
import Link from "next/link";

const supabase = createClient();

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase automatycznie obsługuje token z URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({ title: "Hasło musi mieć min. 6 znaków", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Hasła nie są takie same", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast({ title: "Błąd zmiany hasła", description: error.message, variant: "destructive" });
    } else {
      setDone(true);
      setTimeout(() => router.replace("/feed"), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      <div className="card-base p-8">
        {done ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Hasło zmienione!</h2>
              <p className="text-sm text-muted-foreground">
                Za chwilę zostaniesz przekierowany do aplikacji...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-[hsl(270,75%,60%)]" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Nowe hasło
              </h1>
              <p className="text-sm text-muted-foreground">
                Ustaw nowe hasło do swojego konta Secrely
              </p>
            </div>

            {!sessionReady && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-amber-700">
                  Ładowanie sesji resetowania hasła... Upewnij się że kliknąłeś link z emaila.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nowe hasło
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 znaków"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Potwierdź hasło
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Powtórz nowe hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Hasła nie są takie same</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Hasła są zgodne
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="purple"
                size="lg"
                className="w-full"
                disabled={loading || !sessionReady || newPassword !== confirmPassword || newPassword.length < 6}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Zapisuję...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Ustaw nowe hasło <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Wróć do logowania
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="card-base p-8 flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
