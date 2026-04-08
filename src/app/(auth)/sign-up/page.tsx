"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError("Wypełnij wszystkie pola.");
      return;
    }
    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError("Nazwa użytkownika: 3-20 znaków, tylko małe litery, cyfry i podkreślniki.");
      return;
    }

    setIsLoading(true);

    // 1. Sprawdź unikalność nazwy użytkownika
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .maybeSingle();

    if (existing) {
      setError("Ta nazwa użytkownika jest już zajęta. Wybierz inną.");
      setIsLoading(false);
      return;
    }

    // 2. Utwórz konto — Supabase wyśle email z kodem OTP
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: username.trim(),
        },
        // emailRedirectTo not needed for OTP flow
      },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Wystąpił błąd. Spróbuj ponownie.");
      setIsLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 3. Upsert profil
    await supabase
      .from("profiles")
      .upsert(
        { id: userId, username: username.trim(), display_name: displayName.trim() },
        { onConflict: "id" }
      );

    setIsLoading(false);

    if (authData.session) {
      // Potwierdzenie emaila wyłączone — idź od razu do feedu
      router.replace("/feed");
    } else {
      // Potwierdzenie emaila wymagane — przekieruj na stronę OTP
      router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    }
  };

  const perks = [
    "Zarabiaj na swoich treściach od pierwszego dnia",
    "Własny profil publiczny pod secrely.pl/@ty",
    "Diamenty wypłacalne w każdej chwili",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      <div className="card-base p-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Utwórz konto
          </h1>
          <p className="text-sm text-muted-foreground">
            Dołącz do Secrely i zacznij zarabiać
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-3 mb-6 space-y-2">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-purple-700" />
              </div>
              <span className="text-xs text-purple-800 font-medium">{perk}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Imię i nazwisko
            </label>
            <Input
              type="text"
              placeholder="Jan Kowalski"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nazwa użytkownika
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                @
              </span>
              <Input
                type="text"
                placeholder="jan_kowalski"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                autoComplete="username"
                className="pl-7"
                disabled={isLoading}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              3-20 znaków: małe litery, cyfry, podkreślniki
            </p>
          </div>

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
                placeholder="Minimum 6 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

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
                Tworzę konto...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Zarejestruj się <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Rejestrując się akceptujesz{" "}
            <span className="text-[hsl(270,75%,60%)]">Regulamin</span>{" "}
            oraz{" "}
            <span className="text-[hsl(270,75%,60%)]">Politykę prywatności</span>.
          </p>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-muted-foreground">
            Masz już konto?{" "}
            <Link
              href="/sign-in"
              className="text-[hsl(270,75%,60%)] font-semibold hover:underline"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
