"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { User, Bell, Lock, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe, Eye, Smartphone, Mail, MessageCircle, Zap } from "lucide-react";
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

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(profile?.display_name ?? "");
  const [newBio, setNewBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newDisplayName.trim(), bio: newBio.trim() })
      .eq("id", profile.id);
    setSaving(false);
    if (!error) {
      await refreshProfile();
      setEditingProfile(false);
      toast({ title: "Profile updated!", variant: "success" });
    } else {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    }
  };

  const displayName = getDisplayName(profile);
  const username = getUsername(profile);
  const avatarUrl = profile?.avatar_url ?? "";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      {/* Profile summary */}
      <div className="card-base p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-base">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground">{displayName}</div>
            <div className="text-sm text-muted-foreground">@{username}</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setNewDisplayName(profile?.display_name ?? ""); setNewBio(profile?.bio ?? ""); setEditingProfile(true); }}>
            Edit
          </Button>
        </div>

        {editingProfile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Name</label>
              <Input value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Tell people about yourself…"
                rows={2}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingProfile(false)}>Cancel</Button>
              <Button variant="purple" size="sm" className="flex-1" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </motion.div>
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
          { id: "new_post", label: t.notif1 },
          { id: "likes", label: t.notif2 },
          { id: "comments", label: t.notif3 },
          { id: "follows", label: t.notif4 },
          { id: "messages", label: t.notif5 },
          { id: "promotions", label: t.notif6 },
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

      {/* Support */}
      <Section title={t.support}>
        {[
          { id: "help", label: t.helpCenter, icon: HelpCircle },
          { id: "report", label: t.reportProblem, icon: Shield },
          { id: "feedback", label: t.feedback, icon: MessageCircle },
          { id: "about", label: t.about, icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <SettingRow key={id} icon={Icon} label={label} right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => {}} />
        ))}
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
  icon?: React.ElementType; label: string; description?: string; right: React.ReactNode; onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper {...(onClick ? { onClick } : {})}
      className={cn("w-full flex items-center gap-3 px-4 py-3.5 text-left", onClick && "hover:bg-secondary/60 transition-colors cursor-pointer")}>
      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{right}</div>
    </Wrapper>
  );
}
