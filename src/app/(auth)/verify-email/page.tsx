"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, RotateCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm"><div className="card-base p-8 flex items-center justify-center min-h-[300px]"><div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" /></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInput = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = ["", "", "", "", "", ""];
      digits.forEach((d, i) => { newCode[i] = d; });
      setCode(newCode);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5 && newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp?: string) => {
    const token = otp ?? code.join("");
    if (token.length !== 6) {
      setError("Wprowadź pełny 6-cyfrowy kod.");
      return;
    }

    setIsLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    setIsLoading(false);

    if (verifyError) {
      setError("Nieprawidłowy lub wygasły kod. Sprawdź email lub wyślij nowy kod.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setSuccess("Email potwierdzony! Przekierowuję...");
      setTimeout(() => router.replace("/feed"), 1200);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendLoading(true);
    setError("");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResendLoading(false);

    if (resendError) {
      setError("Nie udało się wysłać kodu. Spróbuj za chwilę.");
    } else {
      setSuccess("Nowy kod wysłany na " + email);
      setResendCooldown(60);
      setTimeout(() => setSuccess(""), 3000);
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
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Potwierdź email
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Wysłaliśmy 6-cyfrowy kod weryfikacyjny na{" "}
            <span className="font-semibold text-foreground">{email}</span>.
            Wpisz go poniżej.
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-6">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              style={{
                width: 44,
                height: 52,
                borderRadius: 12,
                border: digit
                  ? "2px solid hsl(270,75%,60%)"
                  : error
                  ? "2px solid #ef4444"
                  : "1.5px solid rgba(0,0,0,0.12)",
                fontSize: 22,
                fontWeight: 800,
                textAlign: "center",
                outline: "none",
                background: digit ? "hsl(270,75%,97%)" : "#fff",
                color: "hsl(270,75%,35%)",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-destructive bg-red-50 rounded-lg px-3 py-2 mb-4 text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-4 text-center">
            ✓ {success}
          </p>
        )}

        <Button
          onClick={() => handleVerify()}
          variant="purple"
          size="lg"
          className="w-full mb-4"
          disabled={isLoading || code.some((d) => !d)}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Weryfikuję...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Potwierdź konto <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {/* Resend */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Nie dostałeś kodu?</p>
          <button
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(270,75%,60%)] hover:underline disabled:opacity-50 disabled:no-underline mx-auto"
          >
            <RotateCcw className="w-3 h-3" />
            {resendCooldown > 0
              ? `Wyślij ponownie za ${resendCooldown}s`
              : resendLoading
              ? "Wysyłam..."
              : "Wyślij kod ponownie"}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Podałeś zły email?{" "}
            <a
              href="/sign-up"
              className="text-[hsl(270,75%,60%)] font-semibold hover:underline"
            >
              Wróć do rejestracji
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
