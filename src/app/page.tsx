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
  { id: 1, locked: true,  price: 150, likes: 284, views: 1420, caption: "Za kulisami 🎬" },
  { id: 2, locked: false, price: 0,   likes: 512, views: 3200, caption: "Nowy vlog ✨" },
  { id: 3, locked: true,  price: 80,  likes: 97,  views: 540,  caption: "Ekskluzywne 🔒" },
  { id: 4, locked: true,  price: 200, likes: 431, views: 2100, caption: "VIP only 💎" },
];

const DEMO_CREATORS = [
  { name: "Anna Kowalska",      handle: "annafit",    letter: "A", color: "linear-gradient(135deg,#ec4899,#c026d3)", followers: "12.4K", earnings: "8 200" },
  { name: "Mateusz W.",         handle: "mateuszfit", letter: "M", color: "linear-gradient(135deg,#f59e0b,#ef4444)", followers: "8.1K",  earnings: "5 400" },
  { name: "Zofia Lis",          handle: "zofiaart",   letter: "Z", color: "linear-gradient(135deg,#06b6d4,#7c3aed)", followers: "21.3K", earnings: "14 800" },
  { name: "Kacper Nowak",       handle: "kacpervlog", letter: "K", color: "linear-gradient(135deg,#10b981,#3b82f6)", followers: "5.6K",  earnings: "3 100" },
];

// Gradient backgrounds for post thumbnails
const POST_GRADIENTS = [
  "linear-gradient(135deg,#c026d3,#7c3aed)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
  "linear-gradient(135deg,#ec4899,#f97316)",
];

// ── SwipeDemo ─────────────────────────────────────────────────────────────────
const SWIPE_CARDS = [
  { id: 101, handle: "SecrelyUser", price: 75 },
  { id: 102, handle: "SecrelyUser", price: 75 },
  { id: 103, handle: "SecrelyUser", price: 75 },
];

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="white" fillOpacity="0.15" stroke="white"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function SwipeCard({ card, onSwipe, onUnlock }: {
  card: typeof SWIPE_CARDS[0];
  onSwipe: (dir: "left"|"right") => void;
  onUnlock: (price: number) => void;
}) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (unlocked) return;
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
    if (Math.abs(drag) > 90) {
      onSwipe(drag > 0 ? "right" : "left");
    } else {
      setDrag(0);
    }
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUnlocking(true);
    setTimeout(() => { setUnlocked(true); setUnlocking(false); onUnlock(card.price); }, 700);
  };

  const rotate = drag * 0.06;
  const swipeDir = drag > 50 ? "right" : drag < -50 ? "left" : null;

  // Secrely logo content — blurred when locked
  const cardBg = "linear-gradient(160deg, #1a0535 0%, #2d0a5c 40%, #6b21a8 75%, #c026d3 100%)";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute", inset: 0,
        borderRadius: 20,
        background: cardBg,
        cursor: unlocked ? "default" : "grab",
        transform: `translateX(${drag}px) rotate(${rotate}deg)`,
        transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.25,1,0.5,1)",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Top badges */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "4px 10px", fontSize: 10, fontWeight: 700, color: "#fff" }}>Post</div>
        {unlocked ? (
          <div style={{ background: "rgba(16,185,129,0.85)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "4px 10px", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
            🔓 Unlocked
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "4px 10px", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
            <DiamondIcon size={10} color="white" /> {card.price}
          </div>
        )}
      </div>

      {/* Blurred content — Secrely logo */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10,
        filter: unlocked ? "none" : "blur(18px)",
        transform: unlocked ? "scale(1)" : "scale(1.12)",
        transition: "all 0.65s ease",
        pointerEvents: "none",
      }}>
        <DiamondIcon size={72} color="rgba(255,255,255,0.55)" />
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>Secrely</span>
      </div>

      {/* Locked icon overlay */}
      {!unlocked && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, pointerEvents: "none" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}>
            <LockIcon />
          </div>
        </div>
      )}

      {/* Swipe indicators */}
      {swipeDir === "right" && (
        <div style={{ position: "absolute", top: 16, left: 16, padding: "5px 14px", borderRadius: 8, background: "rgba(16,185,129,0.92)", color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", transform: "rotate(-8deg)", border: "2px solid #10b981", zIndex: 10 }}>POMIŃ ✓</div>
      )}
      {swipeDir === "left" && (
        <div style={{ position: "absolute", top: 16, right: 16, padding: "5px 14px", borderRadius: 8, background: "rgba(239,68,68,0.92)", color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", transform: "rotate(8deg)", border: "2px solid #ef4444", zIndex: 10 }}>POMIŃ ✗</div>
      )}

      {/* Bottom gradient + info */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "52%", background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)", zIndex: 6 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px", zIndex: 7 }}>
        {/* User row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#ec4899,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <DiamondIcon size={14} color="white" />
          </div>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>@{card.handle}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>· The magicc</span>
        </div>
        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
          <span>♥ 1</span>
          <span>👁 5</span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, background: "rgba(124,58,237,0.3)", padding: "3px 8px", borderRadius: 100, color: "#e879f9", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
            <DiamondIcon size={9} color="#e879f9" /> Napiwek
          </span>
        </div>
        {/* Unlock button */}
        {!unlocked && (
          <button onClick={handleUnlock} disabled={unlocking} style={{
            width: "100%", padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#c026d3,#7c3aed)",
            color: "#fff", fontSize: 12, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
          }}>
            {unlocking
              ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite" }} />
              : <><DiamondIcon size={12} color="white" /> Odblokuj za {card.price} diamentów</>
            }
          </button>
        )}
        {unlocked && (
          <div style={{ textAlign: "center", color: "#10b981", fontSize: 12, fontWeight: 700, padding: "8px", background: "rgba(16,185,129,0.15)", borderRadius: 12, border: "1px solid rgba(16,185,129,0.3)" }}>
            ✓ Odblokowano pomyślnie
          </div>
        )}
      </div>
    </div>
  );
}

function SwipeDemo({ onUnlock }: { onUnlock: (price: number) => void }) {
  const [stack, setStack] = useState([...SWIPE_CARDS]);
  const [gone, setGone] = useState<number[]>([]);

  const handleSwipe = (dir: "left" | "right") => {
    if (stack.length === 0) return;
    const current = stack[stack.length - 1];
    setGone(g => [...g, current.id]);
    setTimeout(() => {
      setStack(s => {
        const next = s.slice(0, -1);
        if (next.length === 0) {
          // reset
          return SWIPE_CARDS.map(c => ({ ...c, id: c.id + gone.length * 10 }));
        }
        return next;
      });
      setGone(g => g.filter(id => id !== current.id));
    }, 400);
  };

  const remaining = stack.length;

  return (
    <div style={{ background: "#f5f5f7", minHeight: 520, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "16px 14px 14px" }}>
      {/* Top bar matching real app */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#1a0030", letterSpacing: "-0.02em" }}>Swipe</span>
        <div style={{ fontSize: 10, color: "#aaa", fontWeight: 500 }}>{remaining} pozostało</div>
      </div>

      {/* Card stack */}
      <div style={{ position: "relative", width: "100%", flex: 1, maxHeight: 360 }}>
        {/* Shadow card behind */}
        {stack.length > 1 && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, #1a0535 0%, #2d0a5c 40%, #6b21a8 75%, #c026d3 100%)",
            borderRadius: 20, transform: "scale(0.94) translateY(8px)", opacity: 0.4, filter: "blur(2px)",
          }} />
        )}
        {stack.length > 0 && (
          <SwipeCard
            key={stack[stack.length - 1].id}
            card={stack[stack.length - 1]}
            onSwipe={handleSwipe}
            onUnlock={onUnlock}
          />
        )}
      </div>

      {/* Bottom action buttons exactly like real app */}
      <div style={{ width: "100%", paddingTop: 14 }}>
        <div style={{ display: "flex", color: "#aaa", fontSize: 10, marginBottom: 8, justifyContent: "center" }}>
          {remaining} zostało · 0 zapisano
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <button onClick={() => handleSwipe("left")} style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#fff", border: "1.5px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)", cursor: "pointer", fontSize: 20, color: "#ef4444",
            }}>✕</button>
            <span style={{ fontSize: 9, color: "#bbb", fontWeight: 600, letterSpacing: "0.06em" }}>POMIŃ</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <button style={{
              width: 62, height: 62, borderRadius: "50%",
              background: "linear-gradient(135deg,#c026d3,#7c3aed)",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)", cursor: "pointer", fontSize: 22,
            }}>👁</button>
            <span style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700, letterSpacing: "0.06em" }}>WYŚWIETL</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <button onClick={() => handleSwipe("right")} style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#fff", border: "1.5px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)", cursor: "pointer", fontSize: 20, color: "#10b981",
            }}>🔖</button>
            <span style={{ fontSize: 9, color: "#bbb", fontWeight: 600, letterSpacing: "0.06em" }}>ZAPISZ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── End SwipeDemo ─────────────────────────────────────────────────────────────

function AppDemo() {
  const [tab, setTab] = useState<"profile" | "feed" | "discover" | "swipe">("swipe");
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
    setFollowed(prev => { const n = new Set(prev); n.has(handle) ? n.delete(handle) : n.add(handle); return n; });
  };

  const tabs = [
    { id: "swipe"   as const, label: "Swipe",  icon: "💎" },
    { id: "feed"    as const, label: "Feed",   icon: "✦"  },
    { id: "profile" as const, label: "Profil", icon: "👤" },
    { id: "discover"as const, label: "Odkryj", icon: "🔍" },
  ];

  // shared light screen style
  const screenBg = "#f5f5f7";

  return (
    <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, #fafafa 0%, #f0ebff 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 2, background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Interaktywne demo</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontFamily: "'Instrument Serif', serif", fontWeight: 400, color: "#1a0030", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 14 }}>
            Przetestuj jak działa Secrely
          </h2>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 480, margin: "0 auto" }}>
            Kliknij, eksploruj, odblokuj — dokładnie tak jak widzą to Twoi fani.
          </p>
        </div>

        {/* iPhone 16 Pro mockup */}
        <div style={{ maxWidth: 390, margin: "0 auto", position: "relative" }}>
          {/* Toast */}
          <div style={{
            position: "absolute", top: -20, left: "50%",
            transform: `translateX(-50%) translateY(${notification ? 0 : -70}px)`,
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", zIndex: 30,
            background: "linear-gradient(135deg,#c026d3,#7c3aed)", color: "#fff",
            padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700,
            whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(124,58,237,0.45)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <DiamondIcon size={12} color="#fff" /> {notification}
          </div>

          {/* iPhone shell — titanium style */}
          <div style={{
            background: "linear-gradient(180deg, #2a2a2e 0%, #1c1c1e 100%)",
            borderRadius: 54,
            padding: "14px 8px 20px",
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.12),
              0 0 0 2px rgba(0,0,0,0.8),
              0 40px 100px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.15),
              inset 0 -1px 0 rgba(0,0,0,0.3)
            `,
            position: "relative",
          }}>
            {/* Side buttons */}
            <div style={{ position: "absolute", left: -3, top: 120, width: 3, height: 36, background: "linear-gradient(180deg,#3a3a3c,#2a2a2e)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: -3, top: 170, width: 3, height: 60, background: "linear-gradient(180deg,#3a3a3c,#2a2a2e)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: -3, top: 244, width: 3, height: 60, background: "linear-gradient(180deg,#3a3a3c,#2a2a2e)", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", right: -3, top: 180, width: 3, height: 80, background: "linear-gradient(180deg,#3a3a3c,#2a2a2e)", borderRadius: "0 2px 2px 0" }} />

            {/* Screen bezel */}
            <div style={{ background: "#000", borderRadius: 46, overflow: "hidden", position: "relative" }}>
              {/* Dynamic Island */}
              <div style={{ background: "#000", paddingTop: 14, paddingBottom: 6, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 120, height: 34, background: "#0a0a0a", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <div style={{ width: 36, height: 10, borderRadius: 10, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} />
                </div>
              </div>

              {/* App screen */}
              <div style={{ background: screenBg, borderRadius: "0 0 44px 44px", overflow: "hidden", minHeight: 620 }}>

                {/* Status bar */}
                <div style={{ background: "#fff", padding: "8px 20px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>9:41</span>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="#000"><rect x="0" y="3" width="3" height="7" rx="0.5"/><rect x="3.5" y="2" width="3" height="8" rx="0.5"/><rect x="7" y="0.5" width="3" height="9.5" rx="0.5"/><rect x="10.5" y="0" width="3" height="10" rx="0.5"/></svg>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="#000"><path d="M7 2C4.5 2 2.3 3.1 0.8 4.8L2.2 6.2C3.3 4.8 5.1 4 7 4s3.7.8 4.8 2.2l1.4-1.4C11.7 3.1 9.5 2 7 2z"/><path d="M7 5.5C5.6 5.5 4.4 6.1 3.5 7L5 8.5C5.5 7.9 6.2 7.5 7 7.5s1.5.4 2 1L10.5 7C9.6 6.1 8.4 5.5 7 5.5z"/><circle cx="7" cy="10" r="1.2"/></svg>
                    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <div style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid rgba(0,0,0,0.35)", padding: "1.5px", display: "flex", alignItems: "center" }}>
                        <div style={{ width: "80%", height: "100%", background: "#000", borderRadius: 1.5 }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* App top nav */}
                <div style={{ background: "#fff", padding: "8px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DiamondIcon size={13} color="white" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#1a0030", letterSpacing: "-0.02em" }}>Secrely</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🔔</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(124,58,237,0.08)", padding: "4px 10px", borderRadius: 100, border: "1px solid rgba(124,58,237,0.15)" }}>
                      <DiamondIcon size={11} color="#7c3aed" />
                      <span style={{ color: "#7c3aed", fontSize: 11, fontWeight: 800 }}>175</span>
                    </div>
                  </div>
                </div>

                {/* Tab nav */}
                <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                      flex: 1, padding: "9px 4px", border: "none", background: "none", cursor: "pointer",
                      fontSize: 9, fontWeight: tab === t.id ? 800 : 500,
                      color: tab === t.id ? "#7c3aed" : "#aaa",
                      borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent",
                      transition: "all 0.18s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    }}>
                      <span style={{ fontSize: 13 }}>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ── SWIPE TAB ── */}
                {tab === "swipe" && (
                  <SwipeDemo onUnlock={(price) => {
                    setNotification(`Odblokowano! -${price} ♦`);
                    setTimeout(() => setNotification(null), 2500);
                  }} />
                )}

                {/* ── FEED TAB ── */}
                {tab === "feed" && (
                  <div style={{ background: screenBg, minHeight: 520, overflowY: "auto" }}>
                    <div style={{ display: "flex", gap: 6, padding: "10px 12px 6px", overflowX: "auto" }}>
                      {["Obserwowani", "Dla Ciebie", "Na czasie"].map((t, i) => (
                        <div key={t} style={{ padding: "5px 12px", borderRadius: 100, background: i === 1 ? "linear-gradient(135deg,#c026d3,#7c3aed)" : "#fff", color: i === 1 ? "#fff" : "#888", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", border: i !== 1 ? "1px solid rgba(0,0,0,0.08)" : "none", flexShrink: 0 }}>{t}</div>
                      ))}
                    </div>
                    <div style={{ padding: "6px 12px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {DEMO_POSTS.slice(0,3).map((post, i) => {
                        const isUnlocked2 = !post.locked || unlocked.has(post.id);
                        const isUnlocking2 = unlocking === post.id;
                        return (
                          <div key={post.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 8px" }}>
                              <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#ec4899,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>A</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#1a0030" }}>Anna Kowalska</div>
                                <div style={{ fontSize: 9, color: "#aaa" }}>@annafit · 2h temu</div>
                              </div>
                              {isUnlocked2 && <div style={{ fontSize: 9, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 100 }}>✓ Odblokowane</div>}
                            </div>
                            <div style={{ position: "relative", height: 140, background: POST_GRADIENTS[i], overflow: "hidden" }}>
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, filter: isUnlocked2 ? "none" : "blur(14px)", transform: isUnlocked2 ? "scale(1)" : "scale(1.1)", transition: "all 0.55s ease" }}>
                                <DiamondIcon size={32} color="rgba(255,255,255,0.4)" />
                              </div>
                              {isUnlocked2 && <div style={{ position: "absolute", bottom: 8, left: 10, color: "#fff", fontSize: 11, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{post.caption}</div>}
                              {post.locked && !isUnlocked2 && (
                                <button onClick={() => handleUnlock(post.id, post.price)} disabled={isUnlocking2} style={{
                                  position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                                  background: "linear-gradient(135deg,#c026d3,#7c3aed)", border: "none", borderRadius: 100,
                                  padding: "6px 14px", color: "#fff", fontSize: 10, fontWeight: 800, cursor: "pointer",
                                  display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 14px rgba(124,58,237,0.5)",
                                }}>
                                  {isUnlocking2 ? "..." : <><DiamondIcon size={10} color="white" /> {post.price}</>}
                                </button>
                              )}
                              {post.locked && !isUnlocked2 && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(135deg,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <LockIcon />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div style={{ padding: "8px 12px", display: "flex", gap: 12, color: "#ccc", fontSize: 10, alignItems: "center" }}>
                              <span>♥ {post.likes}</span><span>👁 {post.views}</span>
                              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, color: "#9333ea", fontSize: 10, fontWeight: 600, cursor: "pointer" }}><DiamondIcon size={9} color="#9333ea" /> Napiwek</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── PROFILE TAB ── */}
                {tab === "profile" && (
                  <div style={{ background: screenBg, minHeight: 520 }}>
                    <div style={{ background: "linear-gradient(135deg,#1e0030,#3b0764,#6b21a8)", height: 80, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(192,38,211,0.5), transparent 70%)" }} />
                    </div>
                    <div style={{ padding: "0 14px 20px", marginTop: -28 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 15, background: "linear-gradient(135deg,#ec4899,#c026d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", border: "3px solid #fff", boxShadow: "0 4px 16px rgba(192,38,211,0.3)" }}>A</div>
                        <button style={{ padding: "6px 14px", borderRadius: 100, background: "linear-gradient(135deg,#c026d3,#7c3aed)", border: "none", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>+ Obserwuj</button>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#1a0030", letterSpacing: "-0.01em" }}>Anna Kowalska</div>
                      <div style={{ color: "#aaa", fontSize: 10, marginBottom: 6 }}>@annafit</div>
                      <div style={{ color: "#666", fontSize: 11, lineHeight: 1.5, marginBottom: 10 }}>Trenerka personalna 💪 Ekskluzywne plany treningowe.</div>
                      <div style={{ display: "flex", gap: 20, paddingBottom: 12, borderBottom: "1px solid rgba(0,0,0,0.07)", marginBottom: 12 }}>
                        {[["24","postów"],["1.2K","fanów"],["48K","wyśw."]].map(([v,l]) => (
                          <div key={l}><div style={{ fontWeight: 900, fontSize: 14, color: "#1a0030" }}>{v}</div><div style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div></div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {DEMO_POSTS.map((post, i) => {
                          const isUnlocked2 = !post.locked || unlocked.has(post.id);
                          return (
                            <div key={post.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", background: POST_GRADIENTS[i], border: "1px solid rgba(0,0,0,0.06)" }}>
                              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3, filter: isUnlocked2 ? "none" : "blur(10px)", transform: isUnlocked2 ? "scale(1)" : "scale(1.1)", transition: "all 0.5s" }}>
                                <DiamondIcon size={18} color="rgba(255,255,255,0.4)" />
                              </div>
                              {isUnlocked2 && <div style={{ position: "absolute", bottom: 5, left: 6, color: "#fff", fontSize: 8, fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{post.caption}</div>}
                              {post.locked && !isUnlocked2 && (
                                <button onClick={() => handleUnlock(post.id, post.price)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.25)", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                  <div style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg,#c026d3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🔒</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(255,255,255,0.15)", padding: "2px 7px", borderRadius: 100, backdropFilter: "blur(4px)" }}>
                                    <DiamondIcon size={8} color="#e879f9" />
                                    <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>{post.price}</span>
                                  </div>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── DISCOVER TAB ── */}
                {tab === "discover" && (
                  <div style={{ background: screenBg, minHeight: 520 }}>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ background: "#fff", borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(0,0,0,0.08)", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: "#ccc" }}>🔍</span>
                        <span style={{ fontSize: 11, color: "#ccc" }}>Szukaj twórców...</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
                        {["Wszystko","Fitness","Sztuka","Muzyka"].map((c,i) => (
                          <div key={c} style={{ padding: "4px 10px", borderRadius: 100, background: i === 0 ? "linear-gradient(135deg,#c026d3,#7c3aed)" : "#fff", color: i === 0 ? "#fff" : "#888", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", border: i !== 0 ? "1px solid rgba(0,0,0,0.08)" : "none", flexShrink: 0 }}>{c}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 9, color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Popularni twórcy</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {DEMO_CREATORS.map(creator => (
                          <div key={creator.handle} style={{ background: "#fff", borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: creator.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{creator.letter}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a0030" }}>{creator.name}</div>
                              <div style={{ fontSize: 9, color: "#aaa" }}>@{creator.handle} · {creator.followers}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                                <DiamondIcon size={8} color="#c026d3" />
                                <span style={{ fontSize: 9, color: "#c026d3", fontWeight: 700 }}>{creator.earnings} / mies.</span>
                              </div>
                            </div>
                            <button onClick={() => handleFollow(creator.handle)} style={{
                              padding: "5px 10px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: 9, fontWeight: 700,
                              background: followed.has(creator.handle) ? "rgba(124,58,237,0.1)" : "linear-gradient(135deg,#c026d3,#7c3aed)",
                              color: followed.has(creator.handle) ? "#7c3aed" : "#fff", transition: "all 0.2s",
                            }}>{followed.has(creator.handle) ? "✓ Obs." : "Obserwuj"}</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
            {/* Home indicator */}
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px" }}>
              <div style={{ width: 120, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.25)" }} />
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>Podoba Ci się? Zacznij budować swój profil już teraz.</p>
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
