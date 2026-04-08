export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0c0010", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, textAlign: "center", padding: 32 }}>
      <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#ec4899,#c026d3,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Secrely
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, maxWidth: 400 }}>
        Platforma dla twórców treści
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <a href="/sign-up" style={{ padding: "12px 28px", borderRadius: 14, background: "linear-gradient(135deg,#c026d3,#7c3aed)", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          Dołącz →
        </a>
        <a href="/sign-in" style={{ padding: "12px 28px", borderRadius: 14, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", fontSize: 15, textDecoration: "none" }}>
          Zaloguj się
        </a>
      </div>
    </div>
  );
}
