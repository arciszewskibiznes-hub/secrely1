"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>S</span>
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
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>S</span>
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
