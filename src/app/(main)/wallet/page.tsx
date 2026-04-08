"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Gift, Check, Zap, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Diamond } from "@/components/Diamond";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useT, interpolate } from "@/hooks/useT";
import { formatCredits, timeAgo } from "@/lib/utils";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import type { CreditPackage } from "@/types/database";

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "pack_starter", credits: 100, price: 4.99, label: "Starter" },
  { id: "pack_popular", credits: 500, price: 19.99, label: "Popular", popular: true, bonus: 50 },
  { id: "pack_creator", credits: 1200, price: 44.99, label: "Creator", bonus: 200 },
  { id: "pack_pro", credits: 3000, price: 99.99, label: "Pro", bonus: 750 },
];

// 1 credit = 0.01 PLN (adjust as needed)
const CREDIT_TO_PLN = 0.10; // 100 💎 = 10 PLN

export default function WalletPage() {
  const { balance, transactions, addCredits, isLoading } = useCredits();
  const { user } = useAuth();
  const t = useT().wallet;
  const [showPayout, setShowPayout] = useState(false);
  const [payoutCredits, setPayoutCredits] = useState("");
  const [iban, setIban] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  const handlePurchase = async (credits: number, bonus: number | undefined, label: string) => {
    const total = credits + (bonus ?? 0);
    await addCredits(total, interpolate(t.purchased, { label }));
    toast({
      title: interpolate(t.toastTitle, { total: formatCredits(total) }),
      description: t.toastDesc,
      variant: "success",
    });
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const credits = parseInt(payoutCredits, 10);

    // Validation
    if (!fullName.trim() || !iban.trim() || !city.trim() || !street.trim() || !postalCode.trim() || !phone.trim()) {
      toast({ title: "Uzupełnij wszystkie pola", variant: "destructive" });
      return;
    }
    if (isNaN(credits) || credits < 500) {
      toast({ title: "Minimum wypłaty to 500 diamentów (50 zł)", variant: "destructive" });
      return;
    }
    if (balance < credits) {
      toast({ title: "Nie masz wystarczająco kredytów", variant: "destructive" });
      return;
    }

    setPayoutLoading(true);
    const supabase = createClient();
    const amount_pln = parseFloat((credits * CREDIT_TO_PLN).toFixed(2));

    const address = `${street.trim()}, ${postalCode.trim()} ${city.trim()}`;
    const { error } = await supabase.from("payouts").insert({
      user_id: user.id,
      credits,
      amount_pln,
      iban: iban.replace(/\s/g, ""),
      full_name: fullName.trim(),
      address,
      phone: phone.trim(),
    });

    if (!error) {
      await addCredits(-credits, `Wypłata — ${credits} diamentów → ${amount_pln} PLN`);
      toast({ title: "Pomyślnie zlecono wypłatę!", description: `${credits} diamentów → ${amount_pln} PLN — realizacja do 3 dni roboczych`, variant: "success" });
      setShowPayout(false);
      setPayoutCredits(""); setIban(""); setFullName("");
      setCity(""); setStreet(""); setPostalCode(""); setPhone("");
    } else {
      toast({ title: "Błąd zlecenia wypłaty", description: error.message, variant: "destructive" });
    }
    setPayoutLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl purple-gradient p-6 text-white"
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-6 -mb-6" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Diamond size={14} className="text-white/80" />
            <span className="text-sm text-white/80 font-medium">{t.title}</span>
          </div>
          <div className="text-4xl font-bold tabular-nums mb-4">
            {isLoading ? "—" : formatCredits(balance)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.hint}</span>
            </div>
            <button
              onClick={() => setShowPayout((v) => !v)}
              className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1.5 transition-colors font-medium"
            >
              <Banknote className="w-3.5 h-3.5" />
              Wypłata środków
            </button>
          </div>
        </div>
      </motion.div>

      {/* Payout form */}
      {showPayout && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="card-base p-5 border-[hsl(270,75%,60%)] border-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Wypłata środków</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              100 <Diamond size={10} className="text-[hsl(270,75%,60%)] inline" /> = 10 zł · Minimum 500 <Diamond size={10} className="text-[hsl(270,75%,60%)] inline" /> (50 zł) · Realizacja do 3 dni roboczych
            </p>
          </div>
          <form onSubmit={handlePayout} className="space-y-3">
            {/* Credits amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Liczba diamentów do wypłaty
              </label>
              <Input type="number" placeholder="np. 500" value={payoutCredits}
                onChange={(e) => setPayoutCredits(e.target.value)} min="500" />
              {payoutCredits && !isNaN(parseInt(payoutCredits, 10)) && parseInt(payoutCredits, 10) >= 500 && (
                <p className="text-xs text-[hsl(270,75%,60%)] font-semibold flex items-center gap-1">
                  <span>{parseInt(payoutCredits, 10)}</span>
                  <Diamond size={11} className="text-[hsl(270,75%,60%)]" />
                  <span>= {(parseInt(payoutCredits, 10) * CREDIT_TO_PLN).toFixed(2)} PLN</span>
                </p>
              )}
            </div>

            {/* Personal data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Imię</label>
                <Input placeholder="Jan" value={fullName.split(" ")[0] ?? ""} onChange={(e) => setFullName(e.target.value + " " + (fullName.split(" ")[1] ?? ""))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nazwisko</label>
                <Input placeholder="Kowalski" value={fullName.split(" ")[1] ?? ""} onChange={(e) => setFullName((fullName.split(" ")[0] ?? "") + " " + e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ulica i numer</label>
              <Input placeholder="ul. Kwiatowa 12/3" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kod pocztowy</label>
                <Input placeholder="00-000" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Miejscowość</label>
                <Input placeholder="Warszawa" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Numer telefonu</label>
              <Input placeholder="+48 000 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IBAN</label>
              <Input placeholder="PL00 0000 0000 0000 0000 0000 0000"
                value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPayout(false)}>
                Powrót
              </Button>
              <Button type="submit" variant="purple" className="flex-1" disabled={payoutLoading}>
                {payoutLoading ? "Przetwarzam…" : "Zleć wypłatę"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Credit packages */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{t.addCredits}</h2>
        <div className="grid grid-cols-2 gap-3">
          {CREDIT_PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn("card-base p-4 relative cursor-pointer hover:shadow-card-hover transition-shadow", pkg.popular && "border-[hsl(270,75%,60%)] border-2")}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="text-[10px] px-2">{t.popular}</Badge>
                </div>
              )}
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-[hsl(270,75%,60%)]" />
                <span className="text-xs font-semibold text-[hsl(270,75%,60%)]">{pkg.label}</span>
              </div>
              <div className="text-xl font-bold text-foreground tabular-nums">
                {formatCredits(pkg.credits)}
                {pkg.bonus && <span className="text-sm text-emerald-600 font-semibold ml-1">+{pkg.bonus}</span>}
              </div>
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><Diamond size={11} className="text-[hsl(270,75%,60%)]" />{pkg.bonus ? " + bonus" : ""}</div>
              <Button
                size="sm"
                variant={pkg.popular ? "purple" : "outline"}
                className="w-full text-xs h-8"
                onClick={() => handlePurchase(pkg.credits, pkg.bonus, pkg.label)}
              >
                ${pkg.price.toFixed(2)}
              </Button>
              {pkg.bonus && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <Gift className="w-3 h-3" /> {t.bonus}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          💡 Demo: kliknięcie pakietu dodaje diamenty natychmiast
        </p>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{t.history}</h2>
        <div className="card-base divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-secondary animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-48 bg-secondary rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-secondary rounded animate-pulse" />
                </div>
                <div className="h-4 w-10 bg-secondary rounded animate-pulse" />
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", tx.amount > 0 ? "bg-emerald-50" : "bg-red-50")}>
                  {tx.amount > 0
                    ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    : <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{tx.description ?? (tx.type === "spend" ? "Content unlocked" : "Credits added")}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(tx.created_at)}</div>
                </div>
                <div className={cn("text-sm font-semibold tabular-nums flex-shrink-0", tx.amount > 0 ? "text-emerald-600" : "text-rose-500")}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* How credits work */}
      <div className="card-base p-4 bg-purple-50 border-purple-100 space-y-2">
        <h3 className="text-sm font-semibold text-purple-900">{t.howTitle}</h3>
        {[t.how1, t.how2, t.how3, t.how4].map((item) => (
          <div key={item} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-purple-800">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
