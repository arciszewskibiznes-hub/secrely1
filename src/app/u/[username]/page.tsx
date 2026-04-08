"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, Heart, Eye, CheckCircle, X, MessageCircle, Share2, Check, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Diamond } from "@/components/Diamond";
import { UnlockModal } from "@/components/UnlockModal";
import { useAuth } from "@/hooks/useAuth";
import { useUnlocked } from "@/hooks/useUnlocked";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatNumber } from "@/lib/utils";
import type { Post, Profile } from "@/types/database";
import { cn } from "@/lib/utils";

const supabase = createClient();

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isUnlocked } = useUnlocked();

  useEffect(() => {
    const load = async () => {
      const { data: prof } = await supabase
        .from("profiles").select("*").eq("username", params.username).maybeSingle();
      if (!prof) { setIsLoading(false); return; }
      setProfile(prof);
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, creator_id, image_url, caption, teaser_text, price, is_locked, like_count, view_count, comment_count, tags, created_at")
        .eq("creator_id", prof.id)
        .order("created_at", { ascending: false });
      setPosts((postsData ?? []).map((p) => ({ ...p, creator: prof })) as Post[]);
      setIsLoading(false);
    };
    load();
  }, [params.username]);

  const handleUnlockClick = (post: Post) => {
    if (!isAuthenticated) { setSelectedPost(post); setShowAuthPrompt(true); }
    else setSelectedPost(post);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0010" }}>
      <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0c0010" }}>
      <p className="text-white/40 text-sm">Profil nie istnieje</p>
      <Link href="/" className="px-5 py-2.5 text-white rounded-2xl text-sm font-medium"
        style={{ background: "linear-gradient(135deg,#c026d3,#7c3aed)" }}>Strona główna</Link>
    </div>
  );

  const displayName = profile.display_name ?? profile.username ?? "Creator";
  const totalLikes = posts.reduce((s, p) => s + (p.like_count ?? 0), 0);
  const totalViews = posts.reduce((s, p) => s + (p.view_count ?? 0), 0);
  const instagram = (profile as any).instagram as string | null;

  return (
    <div style={{ minHeight: "100vh", background: "#0c0010", color: "#fff" }}>

      {/* ── HERO SECTION ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Cover gradient */}
        <div style={{
          height: 280,
          background: "linear-gradient(160deg, #1e0030 0%, #3b0764 40%, #1a0040 70%, #0c0010 100%)",
          position: "relative",
        }}>
          {/* Subtle radial accent — contained within cover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 120%, rgba(192,38,211,0.35) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)",
          }} />
          {/* Big Secrely text — decorative, sits inside cover */}
          <div style={{
            position: "absolute", bottom: -20, left: 0, right: 0,
            display: "flex", justifyContent: "center",
            pointerEvents: "none", userSelect: "none",
          }}>
            <span style={{
              fontSize: "clamp(72px, 20vw, 160px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              background: "linear-gradient(135deg, rgba(240,171,252,0.12) 0%, rgba(167,139,250,0.08) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Secrely
            </span>
          </div>
        </div>

        {/* Profile info — overlaps cover bottom */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ marginTop: -56, paddingBottom: 32 }}>
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 88, height: 88, borderRadius: 20, overflow: "hidden",
                  border: "3px solid rgba(192,38,211,0.5)",
                  background: "linear-gradient(135deg,#c026d3,#7c3aed)",
                }}>
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage src={profile.avatar_url ?? ""} style={{ objectFit: "cover" }} />
                    <AvatarFallback style={{
                      width: "100%", height: "100%", borderRadius: 0,
                      fontSize: 28, fontWeight: 900, color: "#fff",
                      background: "linear-gradient(135deg,#c026d3,#7c3aed)",
                    }}>
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {profile.is_verified && (
                  <div style={{
                    position: "absolute", bottom: -4, right: -4, width: 22, height: 22,
                    borderRadius: "50%", background: "linear-gradient(135deg,#c026d3,#7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #0c0010",
                  }}>
                    <CheckCircle size={12} color="#fff" />
                  </div>
                )}
              </div>
              {isAuthenticated && user?.id !== profile.id && (
                <Link href="/messages" style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none",
                }}>
                  <MessageCircle size={14} /> Napisz
                </Link>
              )}
            </div>

            {/* Name & bio */}
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 2px", color: "#fff" }}>
                {displayName}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: "0 0 8px" }}>@{profile.username}</p>
              {profile.bio && (
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
              )}
            </div>

            {/* Instagram */}
            {instagram && (
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 10, marginBottom: 16,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)", fontSize: 12, textDecoration: "none",
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @{instagram}
                <ExternalLink size={10} style={{ opacity: 0.4 }} />
              </a>
            )}

            {/* Stats */}
            <div style={{
              display: "flex", gap: 32,
              paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)",
            }}>
              {[
                { label: "postów", value: posts.length },
                { label: "polubień", value: formatNumber(totalLikes) },
                { label: "wyświetleń", value: formatNumber(totalViews) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── NAV (sticky, below hero) ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(12,0,16,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em",
              background: "linear-gradient(135deg,#f0abfc,#a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Secrely</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={copyLink} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 100,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.45)", fontSize: 12, cursor: "pointer",
            }}>
              {copied ? <><Check size={13} color="#e879f9" /> Skopiowano</> : <><Share2 size={13} /> Udostępnij</>}
            </button>
            {!isAuthenticated ? (
              <>
                <Link href="/sign-in" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "none", padding: "7px 12px" }}>Zaloguj</Link>
                <Link href="/sign-up" style={{
                  padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                  background: "linear-gradient(135deg,#c026d3,#7c3aed)", color: "#fff", textDecoration: "none",
                }}>Dołącz</Link>
              </>
            ) : (
              <Link href="/feed" style={{
                padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                background: "linear-gradient(135deg,#c026d3,#7c3aed)", color: "#fff", textDecoration: "none",
              }}>App →</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── POSTS ── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}>
        {posts.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Treści</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>{posts.length} postów</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {posts.map((post, i) => {
                const unlocked = !post.is_locked || (isAuthenticated && isUnlocked(post.id));
                return (
                  <motion.div key={post.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16,1,0.3,1] }}>
                    <div
                      onClick={() => !unlocked && handleUnlockClick(post)}
                      className="group"
                      style={{
                        position: "relative", aspectRatio: "1/1", borderRadius: 16,
                        overflow: "hidden", cursor: "pointer",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        transition: "transform 0.3s ease, border-color 0.3s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.borderColor = "rgba(192,38,211,0.3)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      }}
                    >
                      {post.image_url && (
                        <Image src={post.image_url} alt="" fill
                          className={cn("object-cover transition-transform duration-500 group-hover:scale-105",
                            post.is_locked && !unlocked && "blur-xl scale-110")}
                          sizes="(max-width: 640px) 50vw, 300px" />
                      )}

                      {/* Hover gradient */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />

                      {/* Locked state */}
                      {post.is_locked && !unlocked && (
                        <div style={{
                          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: 10,
                          background: "rgba(8,0,16,0.5)",
                        }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                            background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
                          }}>
                            <Lock size={18} color="#fff" />
                          </div>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 12px", borderRadius: 100,
                            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}>
                            <Diamond size={10} className="text-fuchsia-300" />
                            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{post.price}</span>
                          </div>
                        </div>
                      )}

                      {/* Unlocked badge */}
                      {post.is_locked && unlocked && (
                        <div style={{
                          position: "absolute", top: 10, right: 10, width: 26, height: 26,
                          borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Unlock size={12} color="#fff" />
                        </div>
                      )}

                      {/* Stats on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div style={{ display: "flex", gap: 12, color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 500 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Heart size={11} fill="rgba(255,255,255,0.75)" /> {formatNumber(post.like_count ?? 0)}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Eye size={11} /> {formatNumber(post.view_count ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* CTA */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{
              marginTop: 32, borderRadius: 24, padding: "40px 32px", textAlign: "center",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              position: "relative", overflow: "hidden",
            }}>
            {/* Subtle top glow — contained */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(192,38,211,0.6), transparent)",
            }} />
            <div style={{
              width: 56, height: 56, borderRadius: 18, margin: "0 auto 20px",
              background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Lock size={24} color="#fff" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Odblokuj treści od {displayName}
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              Dołącz do Secrely i uzyskaj dostęp do ekskluzywnych treści tego twórcy
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
              <Link href="/sign-up" style={{
                padding: "13px 24px", borderRadius: 14, textAlign: "center",
                background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
                color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}>Utwórz konto za darmo →</Link>
              <Link href="/sign-in" style={{
                padding: "11px", textAlign: "center",
                color: "rgba(255,255,255,0.35)", fontSize: 13, textDecoration: "none",
              }}>Mam już konto — zaloguj się</Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuthPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 50, display: "flex",
              alignItems: "flex-end", justifyContent: "center", padding: 16,
              background: "rgba(5,0,12,0.8)", backdropFilter: "blur(16px)",
            }}
            onClick={() => setShowAuthPrompt(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              style={{
                borderRadius: 24, padding: 24, width: "100%", maxWidth: 380,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(24px)",
              }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Odblokuj treść</span>
                <button onClick={() => setShowAuthPrompt(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 14, marginBottom: 16,
                background: "rgba(192,38,211,0.08)", border: "1px solid rgba(192,38,211,0.2)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Lock size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Płatna treść</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    Cena: <Diamond size={9} className="text-fuchsia-400" /> {selectedPost?.price} diamentów
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/sign-up" style={{
                  display: "block", padding: "13px", borderRadius: 14, textAlign: "center",
                  background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)",
                  color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>Utwórz konto — odblokuj</Link>
                <Link href="/sign-in" style={{
                  display: "block", padding: "11px", textAlign: "center",
                  color: "rgba(255,255,255,0.35)", fontSize: 13, textDecoration: "none",
                }}>Mam już konto → zaloguj się</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAuthenticated && selectedPost && !isUnlocked(selectedPost.id) && (
        <UnlockModal open={!!selectedPost && !showAuthPrompt} onClose={() => setSelectedPost(null)} post={selectedPost} />
      )}
    </div>
  );
}
