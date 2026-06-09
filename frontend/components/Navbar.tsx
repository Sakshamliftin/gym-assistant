"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        background: "rgba(13,13,15,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "var(--text-primary)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          Gym<span style={{ color: "var(--accent)" }}>Buddy</span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
          className="hidden-mobile"
        >
          <Link href="/#features" style={navLinkStyle}>Features</Link>
          <Link href="/community" style={navLinkStyle}>Community</Link>
          {session && (
            <Link href="/dashboard" style={navLinkStyle}>Dashboard</Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {status === "loading" ? (
            <div style={{ width: "80px", height: "36px", background: "var(--bg-elevated)", borderRadius: "0.5rem" }} />
          ) : session ? (
            <>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {session.user?.name?.split(" ")[0]}
              </span>
              <button
                id="navbar-signout"
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  padding: "0.5rem 1.25rem",
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.625rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                padding: "0.5rem 1.25rem",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
              }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  fontSize: "0.9375rem",
  fontWeight: 500,
  transition: "color 0.2s",
};
