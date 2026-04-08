"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ─── INTERACTIVE APP DEMO ────────────────────────────────────────────────────
function DiamondIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "inline-block", flexShrink: 0 }}>
      <polygon points="12,2 20,9 12,9" fill={color} opacity="0.6" />
      <polygon points="12,2 4,9 12,9" fill={color} opacity="0.85" />
      <polygon points="4,9 12,22 20,9" fill={color} />
      <polygon points="12,9 12,22 20,9" fill={color} opacity="0.75" />
    </svg>
  );
}

const DEMO_POSTS = [
  { id: 1, locked: true,  price: 150, likes: 284, views: 1420, caption: "Za kulisami 🎬", gradient: "linear-gradient(135deg,#c026d3,#7c3aed)" },
  { id: 2, locked: false, price: 0,   likes: 512, views: 3200, caption: "Nowy vlog ✨",  gradient: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { id: 3, locked: true,  price: 80,  likes: 97,  views: 540,  caption: "Ekskluzywne 🔒", gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { id: 4, locked: true,  price: 200, likes: 431, views: 2100, caption: "VIP only 💎",   gradient: "linear-gradient(135deg,#ec4899,#f97316)" },
];

const DEMO_CREATORS = [
  { name: "Anna Kowalska",   handle: "annafit",      letter: "A", color: "linear-gradient(135deg,#ec4899,#c026d3)", followers: "12.4K", earnings: "8 200" },
  { name: "Mateusz Wiśniewski", handle: "mateuszfit", letter: "M", color: "linear-gradient(135deg,#f59e0b,#ef4444)", followers: "8.1K",  earnings: "5 400" },
  { name: "Zofia Lis",       handle: "zofiaart",     letter: "Z", color: "linear-gradient(135deg,#06b6d4,#7c3aed)", followers: "21.3K", earnings: "14 800" },
  { name: "Kacper Nowak",    handle: "kacpervlog",   letter: "K", color: "linear-gradient(135deg,#10b981,#3b82f6)", followers: "5.6K",  earnings: "3 100" },
];

const SWIPE_CARDS = [
  { id: 101, name: "Karolina M.", handle: "karolinam", price: 120, gradient: "linear-gradient(160deg,#1e0030 0%,#3b0764 50%,#c026d3 100%)" },
  { id: 102, name: "Zofia Art",   handle: "zofiaart",   price: 80,  gradient: "linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" },
  { id: 103, name: "Anna Fit",    handle: "annafit",    price: 200, gradient: "linear-gradient(160deg,#1a0040 0%,#6b21a8 60%,#ec4899 100%)" },
];

function SwipeDemo({ onUnlock }: { onUnlock: (price: number) => void }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [flying, setFlying] = useState<"left" | "right" | null>(null);
  const [unlockedCards, setUnlockedCards] = useState<Set<number>>(new Set());
  const [unlockingCard, setUnlockingCard] = useState(false);

  const card = SWIPE_CARDS[cardIndex % SWIPE_CARDS.length];
  const isUnlocked = unlockedCards.has(card.id);

  const fly = (dir: "left" | "right") => {
    setFlying(dir);
    setTimeout(() => {
      setCardIndex(i => i + 1);
      setDrag(0);
      setFlying(null);
    }, 380);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (isUnlocked) return;
    setDragging(true);
    setStartX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDrag(e.clientX - startX);
  };
  const onPointerUp = () => {
    setDragging(false);
    if (Math.abs(drag) > 80) {
      fly(drag > 0 ? "right" : "left");
    } else {
      setDrag(0);
    }
  };

  const handleUnlockCard = () => {
    setUnlockingCard(true);
    setTimeout(() => {
      setUnlockedCards(prev => new Set([...prev, card.id]));
      setUnlockingCard(false);
      onUnlock(card.price);
    }, 700);
  };

  const rotate = flying === "right" ? 25 : flying === "left" ? -25 : drag * 0.08;
  const tx = flying === "right" ? 500 : flying === "left" ? -500 : drag;
  const opacity = flying ? 0 : 1;
  const swipeDir = drag > 40 ? "right" : drag < -40 ? "left" : null;

  return (
    <div style={{ background: "#0c0010", minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", userSelect: "none" }}>
      {/* Label */}
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
        ✦ Tryb Swipe — przesuń kartę
      </div>

      {/* Card stack */}
      <div style={{ position: "relative", width: 220, height: 340 }}>
        {/* Background card (next) */}
        <div style={{
          position: "absolute", inset: 0,
          background: SWIPE_CARDS[(cardIndex + 1) % SWIPE_CARDS.length].gradient,
          borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)",
          transform: "scale(0.93) translateY(10px)",
          filter: "blur(1px)", opacity: 0.5,
        }} />

        {/* Main card */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "absolute", inset: 0,
            background: card.gradient,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.12)",
            cursor: isUnlocked ? "default" : "grab",
            transform: `translateX(${tx}px) rotate(${rotate}deg)`,
            opacity,
            transition: dragging ? "none" : "transform 0.38s cubic-bezier(0.25,1,0.5,1), opacity 0.38s ease",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            touchAction: "none",
          }}
        >
          {/* Blurred content — logo Secrely as watermark */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
            filter: isUnlocked ? "none" : "blur(14px)",
            transform: isUnlocked ? "none" : "scale(1.08)",
            transition: "all 0.6s ease",
          }}>
            <div style={{ opacity: isUnlocked ? 0.9 : 0.15 }}>
              <DiamondIcon size={64} color="white" />
            </div>
            <span style={{ color: isUnlocked ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)", fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>Secrely</span>
          </div>

          {/* Gradient overlay bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />

          {/* Swipe direction indicator */}
          {swipeDir === "right" && (
            <div style={{ position: "absolute", top: 20, left: 20, padding: "6px 14px", borderRadius: 100, background: "rgba(16,185,129,0.9)", border: "2px solid #10b981", color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.05em", transform: "rotate(-12deg)" }}>
              POMIŃ ✓
            </div>
          )}
          {swipeDir === "left" && (
            <div style={{ position: "absolute", top: 20, right: 20, padding: "6px 14px", borderRadius: 100, background: "rgba(239,68,68,0.9)", border: "2px solid #ef4444", color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.05em", transform: "rotate(12deg)" }}>
              POMIŃ ✗
            </div>
          )}

          {/* Profile info */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>
                {card.name[0]}
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>{card.name}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>@{card.handle}</div>
              </div>
            </div>

            {/* Unlock button */}
            {!isUnlocked ? (
              <button onClick={handleUnlockCard} disabled={unlockingCard} style={{
                width: "100%", padding: "10px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
                color: "#fff", fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 4px 20px rgba(192,38,211,0.5)",
                transition: "opacity 0.2s",
                opacity: unlockingCard ? 0.7 : 1,
              }}>
                {unlockingCard ? (
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite" }} />
                ) : (
                  <><DiamondIcon size={12} color="white" /> Odblokuj za {card.price} diamentów</>
                )}
              </button>
            ) : (
              <div style={{ width: "100%", padding: "10px", borderRadius: 14, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                ✓ Odblokowano!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div style={{ display: "flex", gap: 20, marginTop: 24, alignItems: "center" }}>
        <button onClick={() => fly("left")} style={{
          width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.4)",
          background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>✕</button>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, textAlign: "center", lineHeight: 1.4 }}>
          przesuń<br />lub kliknij
        </div>
        <button onClick={() => fly("right")} style={{
          width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(16,185,129,0.4)",
          background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>✓</button>
      </div>

      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 12, textAlign: "center" }}>
        Karta {(cardIndex % SWIPE_CARDS.length) + 1} / {SWIPE_CARDS.length} · wraca po przejściu
      </div>
    </div>
  );
}

function AppDemo() {
  const [tab, setTab] = useState<"profile" | "feed" | "discover" | "swipe">("profile");
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set());
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);

  const handleUnlock = (id: number, price: number) => {
    setUnlocking(id);
    setTimeout(() => {
      setUnlocked(prev => new Set([...prev, id]));
      setUnlocking(null);
      setNotification(`Odblokowano! -${price} ♦`);
      setTimeout(() => setNotification(null), 2000);
    }, 700);
  };

  const handleFollow = (handle: string) => {
    setFollowed(prev => {
      const next = new Set(prev);
      next.has(handle) ? next.delete(handle) : next.add(handle);
      return next;
    });
  };

  const tabs = [
    { id: "profile" as const,  label: "Profil",  icon: "👤" },
    { id: "feed" as const,     label: "Feed",    icon: "✦" },
    { id: "discover" as const, label: "Odkryj",  icon: "🔍" },
    { id: "swipe" as const,    label: "Swipe",   icon: "💎" },
  ];

  return (
    <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, #fafafa 0%, #f3f0ff 100%)", position: "relative", overflow: "hidden" }}>
      {/* bg decoration */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 2, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Interaktywne demo</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "#1a0030", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 14 }}>
            Przetestuj jak działa Secrely
          </h2>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 480, margin: "0 auto" }}>
            Kliknij, eksploruj, odblokuj — dokładnie tak jak widzą to Twoi fani.
          </p>
        </div>

        {/* Device frame */}
        <div style={{ maxWidth: 420, margin: "0 auto", position: "relative" }}>
          {/* Notification toast */}
          <div style={{
            position: "absolute", top: -16, left: "50%", transform: `translateX(-50%) translateY(${notification ? 0 : -60}px)`,
            transition: "transform 0.3s ease", zIndex: 20,
            background: "linear-gradient(135deg,#c026d3,#7c3aed)", color: "#fff",
            padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700,
            whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <DiamondIcon size={12} color="#fff" /> {notification}
          </div>

          {/* Phone shell */}
          <div style={{
            background: "#0c0010",
            borderRadius: 40,
            padding: "16px 10px 10px",
            boxShadow: "0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
            position: "relative",
          }}>
            {/* Notch */}
            <div style={{ width: 100, height: 28, background: "#0c0010", borderRadius: 100, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>

            {/* Screen */}
            <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", minHeight: 560 }}>

              {/* App top bar */}
              <div style={{ background: "#0c0010", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DiamondIcon size={12} color="white" />
                  </div>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>Secrely</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 100 }}>
                  <DiamondIcon size={11} color="#c026d3" />
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>175</span>
                </div>
              </div>

              {/* Tab nav */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    flex: 1, padding: "10px 4px", border: "none", background: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: tab === t.id ? 700 : 500,
                    color: tab === t.id ? "#7c3aed" : "#999",
                    borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent",
                    transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  }}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── PROFILE TAB ── */}
              {tab === "profile" && (
                <div style={{ background: "#0c0010", minHeight: 480 }}>
                  {/* Cover */}
                  <div style={{ height: 90, background: "linear-gradient(135deg,#1e0030,#3b0764)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(192,38,211,0.4), transparent 70%)" }} />
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 48, fontWeight: 900, opacity: 0.07, color: "#fff", letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>Secrely</div>
                  </div>
                  {/* Profile info */}
                  <div style={{ padding: "0 16px 16px", marginTop: -28 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#ec4899,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", border: "3px solid rgba(192,38,211,0.4)" }}>A</div>
                      <button style={{ padding: "6px 14px", borderRadius: 100, background: "linear-gradient(135deg,#c026d3,#7c3aed)", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Obserwuj</button>
                    </div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>Anna Kowalska</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8 }}>@annafit</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>Trenerka personalna 💪 Ekskluzywne plany treningowe i diety tylko tutaj.</div>
                    <div style={{ display: "flex", gap: 20, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: 16 }}>
                      {[["24", "postów"], ["1.2K", "fanów"], ["48K", "wyświetleń"]].map(([v, l]) => (
                        <div key={l}><div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{v}</div><div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div></div>
                      ))}
                    </div>
                    {/* Posts grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {DEMO_POSTS.map(post => {
                        const isUnlocked = !post.locked || unlocked.has(post.id);
                        const isUnlocking = unlocking === post.id;
                        return (
                          <div key={post.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {/* Blurred bg */}
                            <div style={{ position: "absolute", inset: 0, background: post.gradient, filter: isUnlocked ? "none" : "blur(8px)", transform: isUnlocked ? "none" : "scale(1.1)", transition: "all 0.5s ease", opacity: 0.7 }} />
                            {/* Secrely watermark when locked */}
                            {!isUnlocked && (
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                                <DiamondIcon size={20} color="rgba(255,255,255,0.3)" />
                                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>SECRELY</span>
                              </div>
                            )}
                            {/* Unlocked content */}
                            {isUnlocked && (
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", padding: 8 }}>
                                <span style={{ color: "#fff", fontSize: 10, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{post.caption}</span>
                              </div>
                            )}
                            {/* Lock overlay */}
                            {post.locked && !isUnlocked && (
                              <button onClick={() => handleUnlock(post.id, post.price)} disabled={isUnlocking} style={{
                                position: "absolute", inset: 0, width: "100%", height: "100%",
                                background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                              }}>
                                {isUnlocking ? (
                                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite" }} />
                                ) : (
                                  <>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔒</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.12)", padding: "3px 8px", borderRadius: 100, backdropFilter: "blur(4px)" }}>
                                      <DiamondIcon size={9} color="#e879f9" />
                                      <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{post.price}</span>
                                    </div>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── FEED TAB ── */}
              {tab === "feed" && (
                <div style={{ background: "#f8f8fc", minHeight: 480 }}>
                  {/* Feed tabs */}
                  <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
                    {["Obserwowani", "Dla Ciebie", "Na czasie"].map((t, i) => (
                      <div key={t} style={{ padding: "4px 10px", borderRadius: 100, background: i === 1 ? "linear-gradient(135deg,#c026d3,#7c3aed)" : "rgba(0,0,0,0.05)", color: i === 1 ? "#fff" : "#888", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{t}</div>
                    ))}
                  </div>
                  {/* Posts */}
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                    {DEMO_POSTS.slice(0, 2).map(post => {
                      const isUnlocked = !post.locked || unlocked.has(post.id);
                      const isUnlocking = unlocking === post.id;
                      return (
                        <div key={post.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#ec4899,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>A</div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a0030" }}>Anna Kowalska</div>
                              <div style={{ fontSize: 9, color: "#aaa" }}>@annafit · 2h temu</div>
                            </div>
                            {isUnlocked && <div style={{ marginLeft: "auto", fontSize: 9, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 100 }}>✓ Odblokowane</div>}
                          </div>
                          {/* Image area */}
                          <div style={{ position: "relative", height: 160, background: post.gradient, overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, filter: isUnlocked ? "none" : "blur(12px)", transform: isUnlocked ? "none" : "scale(1.15)", transition: "all 0.6s ease" }} />
                            {!isUnlocked && (
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, background: "rgba(0,0,0,0.2)" }}>
                                <DiamondIcon size={24} color="rgba(255,255,255,0.25)" />
                                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>SECRELY</span>
                              </div>
                            )}
                            {isUnlocked && (
                              <div style={{ position: "absolute", bottom: 8, left: 12, color: "#fff", fontSize: 12, fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{post.caption}</div>
                            )}
                            {post.locked && !isUnlocked && (
                              <button onClick={() => handleUnlock(post.id, post.price)} disabled={isUnlocking} style={{
                                position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                                background: "linear-gradient(135deg,#c026d3,#7c3aed)", border: "none", borderRadius: 100,
                                padding: "7px 16px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
                              }}>
                                {isUnlocking ? "Odblokowuję..." : <><DiamondIcon size={11} color="white" /> Odblokuj za {post.price}</>}
                              </button>
                            )}
                          </div>
                          <div style={{ padding: "8px 12px", display: "flex", gap: 14, color: "#bbb", fontSize: 10 }}>
                            <span>♥ {post.likes}</span>
                            <span>👁 {post.views}</span>
                            <span style={{ marginLeft: "auto", cursor: "pointer" }}>Napiwek 💎</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── DISCOVER TAB ── */}
              {tab === "discover" && (
                <div style={{ background: "#f8f8fc", minHeight: 480 }}>
                  <div style={{ padding: "12px 12px 6px" }}>
                    {/* Search bar */}
                    <div style={{ background: "#fff", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(0,0,0,0.08)", marginBottom: 14 }}>
                      <span style={{ fontSize: 13, color: "#ccc" }}>🔍</span>
                      <span style={{ fontSize: 12, color: "#ccc" }}>Szukaj twórców...</span>
                    </div>
                    {/* Category pills */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                      {["Wszystko", "Fitness", "Sztuka", "Muzyka", "Vlogi"].map((c, i) => (
                        <div key={c} style={{ padding: "4px 10px", borderRadius: 100, background: i === 0 ? "linear-gradient(135deg,#c026d3,#7c3aed)" : "rgba(0,0,0,0.06)", color: i === 0 ? "#fff" : "#888", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{c}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Popularni twórcy</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {DEMO_CREATORS.map(creator => (
                        <div key={creator.handle} style={{ background: "#fff", borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: creator.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{creator.letter}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a0030" }}>{creator.name}</div>
                            <div style={{ fontSize: 10, color: "#aaa" }}>@{creator.handle} · {creator.followers} obserwujących</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                              <DiamondIcon size={9} color="#c026d3" />
                              <span style={{ fontSize: 9, color: "#c026d3", fontWeight: 700 }}>{creator.earnings} / mies.</span>
                            </div>
                          </div>
                          <button onClick={() => handleFollow(creator.handle)} style={{
                            padding: "5px 12px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700,
                            background: followed.has(creator.handle) ? "rgba(124,58,237,0.1)" : "linear-gradient(135deg,#c026d3,#7c3aed)",
                            color: followed.has(creator.handle) ? "#7c3aed" : "#fff",
                            transition: "all 0.2s",
                          }}>
                            {followed.has(creator.handle) ? "✓ Obs." : "Obserwuj"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SWIPE TAB ── */}
              {tab === "swipe" && (
                <SwipeDemo onUnlock={(price) => {
                  setNotification(`Odblokowano! -${price} ♦`);
                  setTimeout(() => setNotification(null), 2000);
                }} />
              )}
            </div>

            {/* Home bar */}
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
              <div style={{ width: 100, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
            </div>
          </div>

          {/* CTA below phone */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
              Podoba Ci się? Zacznij budować swój profil już teraz.
            </p>
            <Link href="/sign-up" className="btn-primary">Utwórz konto za darmo →</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMouse);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  const features = [
    { icon: "✦", title: "Zarabiaj na treściach", desc: "Ustaw własne ceny, sprzedawaj posty na sztuki lub subskrypcje. Pełna kontrola nad Twoim zarobkiem." },
    { icon: "◈", title: "Diamenty zamiast gotówki", desc: "Bezpieczny system płatności diamentami. Twoi fani kupują dostęp jednym kliknięciem." },
    { icon: "⬡", title: "Profil publiczny", desc: "Twój unikalny link secrely.pl/@ty — udostępnij go wszędzie i zbuduj społeczność." },
    { icon: "◎", title: "Wiadomości prywatne", desc: "Rozmawiaj bezpośrednio z fanami. Buduj relacje które przekładają się na lojalność." },
    { icon: "⟁", title: "Analityki w czasie rzeczywistym", desc: "Śledź wyświetlenia, polubienia i zarobki. Wiedz co działa, twórz więcej tego." },
    { icon: "⬧", title: "Panel twórcy", desc: "Zarządzaj treściami, publikuj nowe posty i kontroluj wszystko z jednego miejsca." },
  ];

  const stats = [
    { value: "10K+", label: "Twórców" },
    { value: "500K+", label: "Fanów" },
    { value: "2M+", label: "Transakcji" },
    { value: "98%", label: "Zadowolonych" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nav-link { color: #555; font-size: 14px; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #7c3aed; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px;
          background: linear-gradient(135deg, #c026d3, #7c3aed);
          color: #fff; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: all 0.25s;
          box-shadow: 0 8px 32px rgba(124,58,237,0.3);
          font-family: inherit;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.4); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px;
          background: rgba(124,58,237,0.07); border: 1.5px solid rgba(124,58,237,0.2);
          color: #7c3aed; font-size: 15px; font-weight: 600;
          text-decoration: none; transition: all 0.25s;
          font-family: inherit;
        }
        .btn-secondary:hover { background: rgba(124,58,237,0.12); transform: translateY(-1px); }

        .feature-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 24px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(192,38,211,0.04), rgba(124,58,237,0.04));
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.15); }
        .feature-card:hover::before { opacity: 1; }

        .hero-text-gradient {
          background: linear-gradient(135deg, #1a0030 0%, #7c3aed 50%, #c026d3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
        .animate-fade-up-delay-1 { animation: fadeUp 0.7s ease 0.1s forwards; opacity: 0; }
        .animate-fade-up-delay-2 { animation: fadeUp 0.7s ease 0.2s forwards; opacity: 0; }
        .animate-fade-up-delay-3 { animation: fadeUp 0.7s ease 0.35s forwards; opacity: 0; }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none;
        }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px;
          background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.15);
          color: #7c3aed; font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .creator-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          padding: 20px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: all 0.25s;
        }
        .creator-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,58,237,0.12); }

        .avatar-ring {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #ec4899, #c026d3, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 900; font-size: 18px;
          flex-shrink: 0;
        }

        .diamond-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 100px;
          background: linear-gradient(135deg, rgba(192,38,211,0.1), rgba(124,58,237,0.1));
          border: 1px solid rgba(124,58,237,0.2);
          color: #7c3aed; font-size: 12px; font-weight: 700;
        }

        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #c026d3;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px",
        background: scrolled ? "rgba(250,250,250,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polygon points="12,2 20,9 12,9" fill="white" opacity="0.6" />
                <polygon points="12,2 4,9 12,9" fill="white" opacity="0.85" />
                <polygon points="4,9 12,22 20,9" fill="white" />
                <polygon points="12,9 12,22 20,9" fill="white" opacity="0.75" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: "#1a0030" }}>Secrely</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" className="nav-link">Funkcje</a>
            <a href="#how" className="nav-link">Jak to działa</a>
            <a href="#creators" className="nav-link">Twórcy</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/sign-in" className="nav-link" style={{ padding: "8px 16px" }}>Zaloguj się</Link>
            <Link href="/sign-up" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>Zacznij za darmo</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "120px 24px 80px" }}>
        {/* Background orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: "rgba(192,38,211,0.12)", top: -100, right: -200, animation: "float 8s ease-in-out infinite" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "rgba(124,58,237,0.1)", bottom: -100, left: -100, animation: "float2 10s ease-in-out infinite" }} />
        <div className="orb" style={{ width: 300, height: 300, background: "rgba(236,72,153,0.08)", top: "40%", left: "30%", animation: "float 12s ease-in-out 2s infinite" }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.4,
          backgroundImage: "linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
          <div className="animate-fade-up" style={{ marginBottom: 24 }}>
            <span className="tag-pill">✦ Platforma dla twórców treści</span>
          </div>

          <h1 className="animate-fade-up-delay-1" style={{
            fontSize: "clamp(52px, 8vw, 96px)",
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 28,
            color: "#1a0030",
          }}>
            Twórz.{" "}
            <span className="hero-text-gradient" style={{ fontStyle: "italic" }}>Zarabiaj.</span>
            {" "}Rozwijaj się.
          </h1>

          <p className="animate-fade-up-delay-2" style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#666",
            lineHeight: 1.7,
            maxWidth: 560,
            margin: "0 auto 44px",
            fontWeight: 400,
          }}>
            Secrely to platforma gdzie twórcy publikują ekskluzywne treści, fani je odblokowują, a pieniądze trafiają prosto do Ciebie — bez pośredników.
          </p>

          <div className="animate-fade-up-delay-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="btn-primary">
              Zacznij zarabiać →
            </Link>
            <Link href="/sign-in" className="btn-secondary">
              Mam już konto
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fade-up-delay-3" style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {stats.map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#1a0030", letterSpacing: "-0.03em" }}>{value}</div>
                <div style={{ fontSize: 12, color: "#999", fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating creator cards */}
        <div style={{ position: "absolute", left: "3%", top: "35%", animation: "float 7s ease-in-out infinite" }}>
          <div className="creator-card" style={{ width: 220 }}>
            <div className="avatar-ring">A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a0030" }}>Anna K.</div>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>@annakontent</div>
              <div className="diamond-badge">♦ 12 400 / mies.</div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", right: "3%", top: "28%", animation: "float2 9s ease-in-out 1s infinite" }}>
          <div className="creator-card" style={{ width: 220 }}>
            <div className="avatar-ring" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>M</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a0030" }}>Mateusz W.</div>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>@mateuszfit</div>
              <div className="diamond-badge">♦ 8 200 / mies.</div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", right: "5%", bottom: "22%", animation: "float 11s ease-in-out 3s infinite" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "14px 18px", boxShadow: "0 8px 32px rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.1)" }}>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Nowa transakcja</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#7c3aed" }}>+♦ 150 diamentów</div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <AppDemo />

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Jak to działa</div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "#1a0030", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Trzy kroki do zarobku
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {[
              { step: "01", title: "Utwórz profil", desc: "Zarejestruj się, ustaw swoje @, dodaj bio i avatar. Twój profil jest gotowy w 2 minuty." },
              { step: "02", title: "Publikuj treści", desc: "Dodawaj posty — darmowe lub płatne. Ustaw cenę w diamentach i określ kto może oglądać." },
              { step: "03", title: "Zbieraj zarobki", desc: "Fani kupują dostęp do Twoich treści. Środki trafiają na Twoje konto i możesz je wypłacić." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ position: "relative" }}>
                <div style={{ fontSize: 72, fontWeight: 900, color: "rgba(124,58,237,0.08)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8, fontFamily: "'Instrument Serif', serif" }}>{step}</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1a0030", marginBottom: 10, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#777", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 24px", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Funkcje</div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "#1a0030", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Wszystko czego potrzebujesz
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{ fontSize: 28, marginBottom: 16, color: "#c026d3" }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a0030", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREATORS */}
      <section id="creators" style={{ padding: "100px 24px", background: "#fff", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>Dla twórców</div>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "#1a0030", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 24 }}>
                Twój czas i treść<br />
                <span style={{ fontStyle: "italic", color: "#7c3aed" }}>mają wartość</span>
              </h2>
              <p style={{ fontSize: 16, color: "#666", lineHeight: 1.8, marginBottom: 32 }}>
                Koniec z oddawaniem 80% zarobków platformom. Na Secrely ustawiasz własne ceny, budujesz własną społeczność i zatrzymujesz to co zarobiłeś.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                {["Własna strona profilu z unikalnym linkiem", "System diamentów zamiast skomplikowanych płatności", "Bezpośredni kontakt z fanami przez wiadomości", "Panel analityczny z zarobkami na żywo"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/sign-up" className="btn-primary">Zacznij tworzyć →</Link>
            </div>

            {/* Mock profile preview */}
            <div style={{ position: "relative" }}>
              <div style={{
                background: "linear-gradient(160deg, #1e0030 0%, #3b0764 50%, #1a0040 100%)",
                borderRadius: 32, padding: 32,
                boxShadow: "0 40px 100px rgba(124,58,237,0.25)",
              }}>
                {/* Mock nav */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 700 }}>Secrely</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ padding: "6px 14px", borderRadius: 100, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Zaloguj</div>
                    <div style={{ padding: "6px 14px", borderRadius: 100, background: "linear-gradient(135deg,#c026d3,#7c3aed)", color: "#fff", fontSize: 12, fontWeight: 700 }}>Dołącz</div>
                  </div>
                </div>

                {/* Mock profile */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(135deg,#ec4899,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", border: "3px solid rgba(192,38,211,0.4)", flexShrink: 0 }}>K</div>
                  <div>
                    <div style={{ fontWeight: 900, color: "#fff", fontSize: 20, letterSpacing: "-0.02em" }}>Karolina M.</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>@karolina_creates</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 24, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {[["24", "postów"], ["1.2K", "fanów"], ["48K", "wyświetleń"]].map(([v, l]) => (
                    <div key={l}><div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{v}</div><div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div></div>
                  ))}
                </div>

                {/* Mock posts grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 12, background: i % 3 === 1 ? "rgba(192,38,211,0.2)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i % 2 === 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>🔒</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification */}
              <div style={{ position: "absolute", bottom: -20, left: -30, background: "#fff", borderRadius: 16, padding: "12px 18px", boxShadow: "0 12px 40px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 11, color: "#999", marginBottom: 3 }}>Nowy fan odblokował post</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#7c3aed" }}>+♦ 250</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(192,38,211,0.15)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{
          maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10,
          background: "#fff", borderRadius: 40, padding: "80px 60px",
          border: "1px solid rgba(124,58,237,0.12)",
          boxShadow: "0 40px 100px rgba(124,58,237,0.15)",
        }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Zacznij dziś</div>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "#1a0030", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 20 }}>
            Dołącz do tysięcy<br />
            <span style={{ fontStyle: "italic", color: "#c026d3" }}>zarabiających twórców</span>
          </h2>
          <p style={{ fontSize: 16, color: "#777", lineHeight: 1.7, marginBottom: 40 }}>
            Rejestracja jest bezpłatna. Zacznij publikować i zarabiać już dziś.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>
              Utwórz konto za darmo
            </Link>
            <Link href="/sign-in" className="btn-secondary" style={{ fontSize: 16, padding: "16px 36px" }}>
              Zaloguj się
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polygon points="12,2 20,9 12,9" fill="white" opacity="0.6" />
                <polygon points="12,2 4,9 12,9" fill="white" opacity="0.85" />
                <polygon points="4,9 12,22 20,9" fill="white" />
                <polygon points="12,9 12,22 20,9" fill="white" opacity="0.75" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, color: "#1a0030", letterSpacing: "-0.02em" }}>Secrely</span>
          </div>
          <div style={{ fontSize: 13, color: "#bbb" }}>© 2025 Secrely. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>Regulamin</a>
            <a href="#" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>Prywatność</a>
            <a href="#" style={{ fontSize: 13, color: "#999", textDecoration: "none" }}>Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
