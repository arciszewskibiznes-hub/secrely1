"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe, Eye, MessageCircle, Zap, Camera, Link2, Copy, Check, Banknote } from "lucide-react";
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

  const toggle = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const loadPayouts = async () => {
    if (!profile?.id) return;
    setLoadingPayouts(true);
    const { data } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
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
    if (!file.type.startsWith("image/")) {
      toast({ title: "Wybierz plik graficzny", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Zdjęcie musi być mniejsze niż 5MB", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `avatars/${profile.id}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("posts")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast({ title: "Błąd uploadu", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      setAvatarPreview(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("posts").getPublicUrl(uploadData.path);
    
    // Use RPC to bypass schema cache issues
    await supabase.rpc("update_profile_bio", {
      p_id: profile.id,
      p_display_name: profile.display_name ?? "",
      p_bio: profile.bio ?? "",
      p_avatar_url: urlData.publicUrl,
    });

    await refreshProfile();
    toast({ title: "Avatar zaktualizowany!", variant: "success" });
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    if (!newDisplayName.trim()) {
      toast({ title: "Nazwa nie może być pusta", variant: "destructive" });
      return;
    }

    setSaving(true);

    // Always use RPC — bypasses schema cache completely
    // Save instagram separately (direct update since column is visible)
    if (newInstagram.trim() !== (profile.instagram ?? "")) {
      await supabase.from("profiles").update({ instagram: newInstagram.trim() || null }).eq("id", profile.id);
    }

    const { error } = await supabase.rpc("update_profile_bio", {
      p_id: profile.id,
      p_display_name: newDisplayName.trim(),
      p_bio: newBio.trim() || null,
      p_avatar_url: profile.avatar_url ?? null,
    });

    setSaving(false);

    if (!error) {
      await refreshProfile();
      setEditingProfile(false);
      toast({ title: "Profil zapisany!", variant: "success" });
    } else {
      toast({ title: "Błąd zapisu", description: error.message, variant: "destructive" });
    }
  };

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${username}`
    : `/u/${username}`;
  const currentAvatar = avatarPreview ?? profile?.avatar_url ?? "";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }} className="space-y-6">

      {/* Profile card */}
      <div className="card-base p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentAvatar} alt={displayName} />
              <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[hsl(270,75%,60%)] rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            >
              {uploadingAvatar
                ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                : <Camera className="w-3 h-3 text-white" />
              }
            </button>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">{displayName}</div>
            <div className="text-sm text-muted-foreground">@{username}</div>
            {profile?.bio && (
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{profile.bio}</div>
            )}
          </div>

          <Button size="sm" variant="outline" onClick={() => {
            setNewDisplayName(profile?.display_name ?? "");
            setNewBio(profile?.bio ?? "");
            setNewInstagram(profile?.instagram ?? "");
            setEditingProfile((v) => !v);
          }}>
            {editingProfile ? "Anuluj" : "Edytuj"}
          </Button>
        </div>

        {editingProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            className="mt-4 pt-4 border-t border-border space-y-3 overflow-hidden">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Wyświetlana nazwa (nick)
              </label>
              <Input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="np. arciszewski00"
                maxLength={40}
              />
              <p className="text-[10px] text-muted-foreground">
                To będzie Twój nick widoczny wszędzie zamiast pełnego imienia
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bio <span className="font-normal normal-case text-muted-foreground">(max 100 znaków)</span>
              </label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value.slice(0, 100))}
                placeholder="Napisz coś o sobie…"
                rows={2}
                maxLength={100}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <div className={cn("text-[10px] text-right", newBio.length >= 90 ? "text-amber-500" : "text-muted-foreground")}>
                {newBio.length}/100
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                <Input
                  value={newInstagram}
                  onChange={(e) => setNewInstagram(e.target.value.replace(/[@\s]/g, ""))}
                  placeholder="twojnazwa"
                  className="pl-7"
                  maxLength={60}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingProfile(false)}>
                Anuluj
              </Button>
              <Button variant="purple" size="sm" className="flex-1" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Zapisuję…" : "Zapisz"}
              </Button>
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
          <button
            onClick={copyProfileLink}
            className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(270,75%,60%)] hover:opacity-80 transition-opacity flex-shrink-0"
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Skopiowano!</> : <><Copy className="w-3.5 h-3.5" /> Kopiuj</>}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Udostępnij ten link znajomym — zobaczą Twój profil i posty bez logowania
        </p>
      </div>

      {/* Payouts history */}
      <div className="card-base overflow-hidden">
        <button onClick={togglePayouts}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/60 transition-colors">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Zlecone wypłaty</span>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showPayouts && "rotate-90")} />
        </button>

        {showPayouts && (
          <div className="border-t border-border">
            {loadingPayouts ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
                ))}
              </div>
            ) : payouts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Brak zleconych wypłat</p>
              </div>
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
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", st.color)}>
                          {st.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {p.address && <div>📍 {p.address}</div>}
                        {p.phone && <div>📞 {p.phone}</div>}
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
        <SettingRow icon={Moon} label={t.darkMode} description={t.darkModeDesc}
          right={<Switch checked={darkMode} onCheckedChange={setDarkMode} />} />
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 text-sm font-medium text-foreground">{t.language}</div>
          <LangToggle />
        </div>
        <SettingRow icon={Eye} label={t.contentPrefs} description={t.contentPrefsDesc}
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => {}} />
      </Section>

      {/* Notifications */}
      <Section title={t.notificationsSection}>
        {[
          { id: "new_post", label: t.notif1 },
          { id: "likes", label: t.notif2 },
          { id: "comments", label: t.notif3 },
          { id: "follows", label: t.notif4 },
          { id: "messages", label: t.notif5 },
          { id: "promotions", label: t.notif6 },
        ].map(({ id, label }) => (
          <SettingRow key={id} label={label}
            right={<Switch checked={toggles[id]} onCheckedChange={() => toggle(id)} />} />
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
          <SettingRow key={id} label={label} description={desc}
            right={<Switch checked={toggles[id]} onCheckedChange={() => toggle(id)} />} />
        ))}
      </Section>

      {/* Support */}
      <Section title={t.support}>
        {[
          { id: "help", label: t.helpCenter, icon: HelpCircle },
          { id: "report", label: t.reportProblem, icon: Shield },
          { id: "feedback", label: t.feedback, icon: MessageCircle },
          { id: "about", label: t.about, icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <SettingRow key={id} icon={Icon} label={label}
            right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => {}} />
        ))}
      </Section>

      {/* Sign out */}
      <div className="card-base overflow-hidden">
        {!showSignOutConfirm ? (
          <button onClick={() => setShowSignOutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-rose-500">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{t.signOut}</span>
          </button>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">{t.signOutConfirm}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowSignOutConfirm(false)}>
                {t.cancel}
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleSignOut}>
                {t.signOut}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground pb-4">{t.version}</p>
    </motion.div>
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
      className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left",
        onClick && "hover:bg-secondary/60 transition-colors cursor-pointer")}>
      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{right}</div>
    </Tag>
  );
}
