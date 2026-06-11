import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "4rem 1.5rem 3rem",
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "3rem",
          marginBottom: "3rem",
        }}
      >
        {/* Brand section */}
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--text-primary)",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            Gym<span style={{ color: "var(--accent)" }}>Buddy</span>
          </div>
          <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            The ultimate companion for tracking workouts, breaking personal records, and training smarter with your personal AI coach.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem" }}>Explore</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li>
              <Link href="/#features" className="nav-link">Features</Link>
            </li>
            <li>
              <Link href="/community" className="nav-link">Community</Link>
            </li>
            <li>
              <Link href="/about" className="nav-link">About Us</Link>
            </li>
          </ul>
        </div>

        {/* Resources / Legals */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem" }}>Resources</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li>
              <Link href="/privacy" className="nav-link">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="nav-link">Terms of Service</Link>
            </li>
            <li>
              <Link href="/faq" className="nav-link">Help & FAQ</Link>
            </li>
          </ul>
        </div>

        {/* Social / Contact */}
        <div>
          <h4 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem", marginBottom: "1.25rem" }}>Connect With Us</h4>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Follow our journey and get daily fitness tips.
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontWeight: 600 }}>
              Instagram
            </Link>
            <span style={{ color: "var(--border)" }}>•</span>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontWeight: 600 }}>
              Twitter (X)
            </Link>
            <span style={{ color: "var(--border)" }}>•</span>
            <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontWeight: 600 }}>
              YouTube
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
        }}
      >
        <span>© {new Date().getFullYear()} GymBuddy. All rights reserved.</span>
        <span>Made for athletes, by athletes.</span>
      </div>
    </footer>
  );
}
