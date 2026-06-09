import Link from "next/link";
import FeaturesGrid from "@/components/FeaturesGrid";

const stats = [
  { value: "10k+", label: "Workouts logged" },
  { value: "500+", label: "Active athletes" },
  { value: "98%", label: "PR detection accuracy" },
  { value: "24/7", label: "AI coach availability" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-base)" }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "5rem 1.5rem 4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
         <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
        {/* Background glow blobs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: "10%", left: "50%",
            transform: "translateX(-50%)", width: "700px", height: "700px",
            background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute", bottom: "5%", left: "10%",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
        </div>

        <div style={{ maxWidth: "860px", position: "relative" }}>
          {/* Badge */}
          <div
            className="animate-fade-up"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.375rem 1rem",
              background: "var(--accent-muted)",
              border: "1px solid rgba(108,99,255,0.3)",
              borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 600,
              color: "#a78bfa", marginBottom: "2rem",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}
          >
            
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up animate-delay-1"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 900,
              lineHeight: 1.1, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: "1.5rem",
            }}
          >
            Train smarter.{" "}
            <span className="gradient-text">Break PRs.</span>
            <br />
            Never skip leg day.
          </h1>

          {/* Sub-headline */}
          <p
            className="animate-fade-up animate-delay-2"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "var(--text-secondary)", lineHeight: 1.7,
              maxWidth: "600px", margin: "0 auto 2.5rem",
            }}
          >
            GymBuddy logs your workouts, surfaces performance insights, and
            gives you a personalized AI coach that actually knows your training
            history.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-up animate-delay-3"
            style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/signup" className="btn-primary" id="hero-cta-signup">
              Start for free →
            </Link>
            <Link href="/login" className="btn-secondary" id="hero-cta-login">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "2.5rem 1.5rem",
        background: "var(--bg-surface)",
      }}>
        <div style={{
          maxWidth: "1000px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "2rem", textAlign: "center",
        }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{
                fontSize: "2.25rem", fontWeight: 800,
                color: "var(--accent)", letterSpacing: "-0.02em",
              }}>
                {s.value}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" style={{ padding: "6rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800,
            letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "1rem",
          }}>
            Everything you need to{" "}
            <span className="gradient-text">level up</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            From the first rep to the championship podium — GymBuddy has the
            tools, data, and intelligence to get you there.
          </p>
        </div>

        {/* Client component handles hover interactivity */}
        <FeaturesGrid />
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{
        padding: "5rem 1.5rem", textAlign: "center",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
      }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800,
            letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "1rem",
          }}>
            Ready to train like you mean it?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Join hundreds of athletes already using GymBuddy to track progress,
            break PRs, and train with purpose.
          </p>
          <Link href="/signup" className="btn-primary" id="bottom-cta-signup">
            Get started free →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "2rem 1.5rem", textAlign: "center",
        color: "var(--text-muted)", fontSize: "0.875rem",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "1rem",
        }}>
          <span>
            <strong style={{ color: "var(--text-secondary)" }}>GymBuddy</strong> — Train smarter.
          </span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Login</Link>
            <Link href="/signup" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Sign Up</Link>
            <Link href="/#features" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Features</Link>
          </div>
          <span>© 2026 GymBuddy</span>
        </div>
      </footer>
    </div>
  );
}
