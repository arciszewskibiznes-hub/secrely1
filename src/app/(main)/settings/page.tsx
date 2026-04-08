"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Shield, LogOut, ChevronRight, Moon, Globe, Eye, MessageCircle, Zap, Camera, Link2, Copy, Check, Banknote, X, FileText, Lock, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LangToggle } from "@/components/LangToggle";
import { useAuth, getDisplayName, getUsername } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/hooks/useT";
import { toast } from "@/hooks/useToast";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const supabase = createClient();

// ── Legal content ─────────────────────────────────────────────────────────────
const REGULAMIN = `
§1. POSTANOWIENIA OGÓLNE
1. Niniejszy Regulamin określa zasady korzystania z platformy Secrely dostępnej pod adresem secrely.pl.
2. Operatorem platformy jest właściciel domeny secrely.pl.
3. Korzystanie z platformy oznacza akceptację niniejszego Regulaminu.

§2. REJESTRACJA I KONTO
1. Korzystanie z pełnych funkcji platformy wymaga założenia konta.
2. Użytkownik musi mieć ukończone 18 lat.
3. Jeden użytkownik może posiadać tylko jedno konto.
4. Użytkownik jest odpowiedzialny za bezpieczeństwo swojego hasła.

§3. DIAMENTY I PŁATNOŚCI
1. Diamenty to wirtualna waluta platformy Secrely.
2. Zakup diamentów jest realizowany przez zewnętrznego operatora płatności (Stripe).
3. Diamenty nie podlegają zwrotowi po ich wydaniu na treści.
4. Minimalna kwota wypłaty wynosi 500 diamentów (50 zł).
5. Wypłaty są realizowane w ciągu 3 dni roboczych.

§4. TREŚCI
1. Użytkownicy mogą publikować treści zgodne z prawem polskim i unijnym.
2. Zabrania się publikowania treści naruszających prawa osób trzecich.
3. Zabrania się publikowania treści przedstawiających osoby nieletnie.
4. Operator zastrzega sobie prawo do usunięcia treści naruszających Regulamin.

§5. ODPOWIEDZIALNOŚĆ
1. Operator nie ponosi odpowiedzialności za treści publikowane przez użytkowników.
2. Operator dokłada wszelkich starań, aby platforma działała bez przerw.
3. Operator zastrzega sobie prawo do czasowego wyłączenia platformy w celach konserwacyjnych.

§6. POSTANOWIENIA KOŃCOWE
1. Operator zastrzega sobie prawo do zmiany Regulaminu.
2. O zmianach Regulaminu użytkownicy będą informowani z wyprzedzeniem.
3. W sprawach nieuregulowanych niniejszym Regulaminem stosuje się przepisy prawa polskiego.
`;

const POLITYKA = `
§1. ADMINISTRATOR DANYCH
Administratorem danych osobowych jest właściciel platformy Secrely (secrely.pl).

§2. ZAKRES ZBIERANYCH DANYCH
Platforma zbiera następujące dane:
• Adres e-mail (wymagany do rejestracji)
• Nazwa użytkownika i wyświetlana nazwa
• Dane profilowe (bio, avatar)
• Historia transakcji (zakupy diamentów, wypłaty)
• Dane do wypłat (imię, nazwisko, IBAN, adres)

§3. CEL PRZETWARZANIA DANYCH
Dane są przetwarzane w celu:
• Świadczenia usług platformy
• Obsługi płatności i wypłat
• Komunikacji z użytkownikiem
• Zapewnienia bezpieczeństwa platformy

§4. PODSTAWA PRAWNA
Dane przetwarzamy na podstawie:
• Art. 6 ust. 1 lit. b RODO — wykonanie umowy
• Art. 6 ust. 1 lit. c RODO — obowiązek prawny
• Art. 6 ust. 1 lit. f RODO — uzasadniony interes

§5. PRAWA UŻYTKOWNIKA
Użytkownik ma prawo do:
• Dostępu do swoich danych
• Sprostowania danych
• Usunięcia konta i danych
• Przenoszenia danych
• Wniesienia skargi do UODO

§6. BEZPIECZEŃSTWO
• Dane są przechowywane na serwerach Supabase z szyfrowaniem
• Płatności obsługuje Stripe (certyfikat PCI DSS)
• Hasła są przechowywane w formie zaszyfrowanej

§7. KONTAKT
W sprawach dotyczących danych osobowych: kontakt przez platformę Secrely.
`;

// ── Legal Modal ───────────────────────────────────────────────────────────────
function LegalModal({ type, onClose }: { type: "regulamin" | "polityka"; onClose: () => void }) {
  const title = type === "regulamin" ? "Regulamin platformy" : "Polityka prywatności";
  const content = type === "regulamin" ? REGULAMIN : POLITYKA;

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
          className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[hsl(270,75%,60%)]" />
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-5 py-4">
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border flex-shrink-0">
            <Button variant="purple" className="w-full" onClick={onClose}>
              Rozumiem i akceptuję
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Password Reset Modal ──────────────────────────────────────────────────────
function PasswordResetModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"email" | "code" | "newpass">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Kod wysłany!", description: "Sprawdź swoją skrzynkę email.", variant: "success" });
      setStep("code");
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Nieprawidłowy kod", variant: "destructive" });
    } else {
      setStep("newpass");
    }
  };

  const handleSetPassword = async () => {
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
      toast({ title: "Hasło zmienione!", variant: "success" });
      onClose();
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
              <h2 className="text-sm font-bold text-foreground">Zmiana hasła</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {step === "email" && (
              <>
                <p className="text-xs text-muted-foreground">Podaj swój adres email — wyślemy Ci kod do zmiany hasła.</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                  <Input
                    type="email"
                    placeholder="ty@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button variant="purple" className="w-full" onClick={handleSendCode} disabled={loading || !email.trim()}>
                  {loading ? "Wysyłam..." : "Wyślij kod"}
                </Button>
              </>
            )}

            {step === "code" && (
              <>
                <p className="text-xs text-muted-foreground">Wpisz kod który wysłaliśmy na <strong>{email}</strong></p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kod weryfikacyjny</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="text-center text-xl font-bold tracking-widest"
                  />
                </div>
                <Button variant="purple" className="w-full" onClick={handleVerifyCode} disabled={loading || code.length < 6}>
                  {loading ? "Weryfikuję..." : "Potwierdź kod"}
                </Button>
                <button className="text-xs text-[hsl(270,75%,60%)] w-full text-center" onClick={() => setStep("email")}>
                  Zmień email
                </button>
              </>
            )}

            {step === "newpass" && (
              <>
                <p className="text-xs text-muted-foreground">Ustaw nowe hasło dla swojego konta.</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nowe hasło</label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 znaków"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Potwierdź hasło</label>
                  <Input
                    type="password"
                    placeholder="Powtórz hasło"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button variant="purple" className="w-full" onClick={handleSetPassword} disabled={loading}>
                  {loading ? "Zapisuję..." : "Zmień hasło"}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const t = useT().settings;

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    new_post: true, likes: true, comments: true, follows: true, messages: true, promotions: false,
    private: false, show_activity: true, read_receipts: true, data_analytics: true,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showPayouts, setShowPayouts] = useState(false);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newInstagram, setNewInstagram] = useState(profile?.instagram ?? "");
  const [newDisplayName, setNewDisplayName] = useState(profile?.display_name ?? "");
  const [newBio, setNewBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [legalModal, setLegalModal] = useState<"regulamin" | "polityka" | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const toggle = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const loadPayouts = async () => {
    if (!profile?.id) return;
    setLoadingPayouts(true);
    const { data } = await supabase.from("payouts").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });
    setPayouts(data ?? []);
    setLoadingPayouts(false);
  };

  const togglePayouts = () => {
    if (!showPayouts) loadPayouts();
    setShowPayouts((v) => !v);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const handleAvatarChange = async (file: File) => {
    if (!profile?.id) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Wybierz plik graficzny", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Zdjęcie musi być mniejsze niż 5MB", variant: "destructive" }); return; }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `avatars/${profile.id}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from("posts").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { toast({ title: "Błąd uploadu", description: uploadError.message, variant: "destructive" }); setUploadingAvatar(false); setAvatarPreview(null); return; }
    const { data: urlData } = supabase.storage.from("posts").getPublicUrl(uploadData.path);
    await supabase.rpc("update_profile_bio", { p_id: profile.id, p_display_name: profile.display_name ?? "", p_bio: profile.bio ?? "", p_avatar_url: urlData.publicUrl });
    await refreshProfile();
    toast({ title: "Avatar zaktualizowany!", variant: "success" });
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    if (!newDisplayName.trim()) { toast({ title: "Nazwa nie może być pusta", variant: "destructive" }); return; }
    setSaving(true);
    if (newInstagram.trim() !== (profile.instagram ?? "")) {
      await supabase.from("profiles").update({ instagram: newInstagram.trim() || null }).eq("id", profile.id);
    }
    const { error } = await supabase.rpc("update_profile_bio", { p_id: profile.id, p_display_name: newDisplayName.trim(), p_bio: newBio.trim() || null, p_avatar_url: profile.avatar_url ?? null });
    setSaving(false);
    if (!error) { await refreshProfile(); setEditingProfile(false); toast({ title: "Profil zapisany!", variant: "success" }); }
    else { toast({ title: "Błąd zapisu", description: error.message, variant: "destructive" }); }
  };

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/u/${username}` : `/u/${username}`;
  const currentAvatar = avatarPreview ?? profile?.avatar_url ?? "";

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

        {/* Profile card */}
        <div className="card-base p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16">
                <AvatarImage src={currentAvatar} alt={displayName} />
                <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[hsl(270,75%,60%)] rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
                {uploadingAvatar ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">{displayName}</div>
              <div className="text-sm text-muted-foreground">@{username}</div>
              {profile?.bio && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{profile.bio}</div>}
            </div>
            <Button size="sm" variant="outline" onClick={() => { setNewDisplayName(profile?.display_name ?? ""); setNewBio(profile?.bio ?? ""); setNewInstagram(profile?.instagram ?? ""); setEditingProfile((v) => !v); }}>
              {editingProfile ? "Anuluj" : "Edytuj"}
            </Button>
          </div>

          {editingProfile && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-border space-y-3 overflow-hidden">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wyświetlana nazwa</label>
                <Input value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="np. arciszewski00" maxLength={40} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio <span className="font-normal normal-case">(max 100 znaków)</span></label>
                <textarea value={newBio} onChange={(e) => setNewBio(e.target.value.slice(0, 100))} placeholder="Napisz coś o sobie…" rows={2} maxLength={100}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                <div className={cn("text-[10px] text-right", newBio.length >= 90 ? "text-amber-500" : "text-muted-foreground")}>{newBio.length}/100</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instagram</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                  <Input value={newInstagram} onChange={(e) => setNewInstagram(e.target.value.replace(/[@\s]/g, ""))} placeholder="twojnazwa" className="pl-7" maxLength={60} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingProfile(false)}>Anuluj</Button>
                <Button variant="purple" size="sm" className="flex-1" onClick={handleSaveProfile} disabled={saving}>{saving ? "Zapisuję…" : "Zapisz"}</Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Public profile link */}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[hsl(270,75%,60%)]" />
            <span className="text-sm font-semibold text-foreground">Twój publiczny profil</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
            <span className="text-xs text-muted-foreground flex-1 truncate">{profileUrl}</span>
            <button onClick={copyProfileLink} className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(270,75%,60%)] hover:opacity-80 transition-opacity flex-shrink-0">
              {copied ? <><Check className="w-3.5 h-3.5" /> Skopiowano!</> : <><Copy className="w-3.5 h-3.5" /> Kopiuj</>}
            </button>
          </div>
        </div>

        {/* Payouts history */}
        <div className="card-base overflow-hidden">
          <button onClick={togglePayouts} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/60 transition-colors">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Zlecone wypłaty</span>
            </div>
            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showPayouts && "rotate-90")} />
          </button>
          {showPayouts && (
            <div className="border-t border-border">
              {loadingPayouts ? (
                <div className="p-4 space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
              ) : payouts.length === 0 ? (
                <div className="p-6 text-center"><p className="text-sm text-muted-foreground">Brak zleconych wypłat</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {payouts.map((p) => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      pending: { label: "Oczekujące", color: "text-amber-600 bg-amber-50 border-amber-200" },
                      completed: { label: "Zrealizowano", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                      rejected: { label: "Odrzucono", color: "text-rose-600 bg-rose-50 border-rose-200" },
                    };
                    const st = statusMap[p.status] ?? statusMap.pending;
                    return (
                      <div key={p.id} className="px-4 py-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{p.amount_pln} PLN</div>
                            <div className="text-xs text-muted-foreground">{p.credits} diamentów · {p.full_name}</div>
                          </div>
                          <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", st.color)}>{st.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {p.address && <div>📍 {p.address}</div>}
                          <div>IBAN: {p.iban}</div>
                          <div>{new Date(p.created_at).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" })}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Appearance */}
        <Section title={t.appearance}>
          <SettingRow icon={Moon} label={t.darkMode} description={t.darkModeDesc} right={<Switch checked={darkMode} onCheckedChange={setDarkMode} />} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 text-sm font-medium text-foreground">{t.language}</div>
            <LangToggle />
          </div>
          <SettingRow icon={Eye} label={t.contentPrefs} description={t.contentPrefsDesc} right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => {}} />
        </Section>

        {/* Notifications */}
        <Section title={t.notificationsSection}>
          {[
            { id: "new_post", label: t.notif1 }, { id: "likes", label: t.notif2 },
            { id: "comments", label: t.notif3 }, { id: "follows", label: t.notif4 },
            { id: "messages", label: t.notif5 }, { id: "promotions", label: t.notif6 },
          ].map(({ id, label }) => (
            <SettingRow key={id} label={label} right={<Switch checked={toggles[id]} onCheckedChange={() => toggle(id)} />} />
          ))}
        </Section>

        {/* Privacy */}
        <Section title={t.privacy}>
          {[
            { id: "private", label: t.priv1, desc: t.priv1Desc },
            { id: "show_activity", label: t.priv2, desc: t.priv2Desc },
            { id: "read_receipts", label: t.priv3, desc: t.priv3Desc },
            { id: "data_analytics", label: t.priv4, desc: t.priv4Desc },
          ].map(({ id, label, desc }) => (
            <SettingRow key={id} label={label} description={desc} right={<Switch checked={toggles[id]} onCheckedChange={() => toggle(id)} />} />
          ))}
        </Section>

        {/* Security */}
        <Section title="Bezpieczeństwo">
          <SettingRow icon={KeyRound} label="Zmień hasło" description="Ustaw nowe hasło do swojego konta"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setShowPasswordReset(true)} />
          <SettingRow icon={Lock} label="Weryfikacja dwuetapowa" description="Wkrótce dostępne"
            right={<span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full">Wkrótce</span>} />
        </Section>

        {/* Legal */}
        <Section title="Prawne">
          <SettingRow icon={FileText} label="Regulamin platformy" description="Zasady korzystania z Secrely"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setLegalModal("regulamin")} />
          <SettingRow icon={Shield} label="Polityka prywatności" description="Jak chronimy Twoje dane"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
            onClick={() => setLegalModal("polityka")} />
          <SettingRow icon={MessageCircle} label="Zgłoś problem" description="Napisz do nas"
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => {}} />
          <SettingRow icon={Zap} label="O aplikacji" description="Secrely v1.0"
            right={<span className="text-xs text-muted-foreground">v1.0</span>} />
        </Section>

        {/* Sign out */}
        <div className="card-base overflow-hidden">
          {!showSignOutConfirm ? (
            <button onClick={() => setShowSignOutConfirm(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-rose-500">
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{t.signOut}</span>
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">{t.signOutConfirm}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowSignOutConfirm(false)}>{t.cancel}</Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={handleSignOut}>{t.signOut}</Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">{t.version}</p>
      </motion.div>

      {/* Modals */}
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
      {showPasswordReset && <PasswordResetModal onClose={() => setShowPasswordReset(false)} />}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</h3>
      <div className="card-base divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, description, right, onClick }: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  right: React.ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag {...(onClick ? { onClick } : {})}
      className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left", onClick && "hover:bg-secondary/60 transition-colors cursor-pointer")}>
      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{right}</div>
    </Tag>
  );
}
