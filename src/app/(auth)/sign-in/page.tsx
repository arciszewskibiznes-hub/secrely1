"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/useToast";

const supabase = createClient();

// ── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } else {
      setStep("sent");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[hsl(270,75%,60%)]" />
              <h2 className="text-sm font-bold text-foreground">Reset hasła</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {step === "email" ? (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Podaj adres email powiązany z Twoim kontem. Wyślemy Ci link do resetowania hasła.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="ty@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    autoFocus
                  />
                </div>
                <Button
                  variant="purple"
                  className="w-full"
                  onClick={handleSend}
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wysyłam...
                    </span>
                  ) : (
                    "Wyślij link resetujący"
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  Pamiętasz hasło?{" "}
                  <button onClick={onClose} className="text-[hsl(270,75%,60%)] font-semibold hover:underline">
                    Wróć do logowania
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Success state */}
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                    <span className="text-3xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Sprawdź skrzynkę!</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Wysłaliśmy link do resetowania hasła na{" "}
                      <span className="font-semibold text-foreground">{email}</span>.
                      Kliknij go aby ustawić nowe hasło.
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Nie widzisz emaila? Sprawdź folder spam lub{" "}
                    <button
                      onClick={() => setStep("email")}
                      className="text-[hsl(270,75%,60%)] font-semibold hover:underline"
                    >
                      spróbuj ponownie
                    </button>
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Zamknij
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sign In Page ──────────────────────────────────────────────────────────────
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Wypełnij wszystkie pola.");
      return;
    }

    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
        setError("Nieprawidłowy email lub hasło. Spróbuj ponownie.");
      } else if (authError.message.includes("Email not confirmed")) {
        setError("Potwierdź swój adres email przed zalogowaniem.");
      } else {
        setError(authError.message);
      }
    } else {
      router.replace("/feed");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="card-base p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Witaj z powrotem
            </h1>
            <p className="text-sm text-muted-foreground">
              Zaloguj się na swoje konto Secrely
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <Input
                type="email"
                placeholder="ty@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hasło
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                  disabled={isLoading}
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

            {error && (
              <p className="text-xs text-destructive bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-[hsl(270,75%,60%)] hover:underline font-medium"
              >
                Zapomniałeś hasła?
              </button>
            </div>

            <Button
              type="submit"
              variant="purple"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logowanie...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Zaloguj się <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link href="/sign-up" className="text-[hsl(270,75%,60%)] font-semibold hover:underline">
                Zarejestruj się za darmo
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
}
