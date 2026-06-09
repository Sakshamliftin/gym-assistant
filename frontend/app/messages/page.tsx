"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInbox = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !content.trim()) return;
    
    setSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, content }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: "Message sent!" });
        setEmail("");
        setContent("");
      } else {
        setStatus({ type: "error", text: data.error || "Failed to send." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading inbox...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Messages</h1>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
          Dashboard
        </Link>
      </div>

      {/* Send Message Form */}
      <div style={{ background: "var(--bg-elevated)", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 1rem" }}>New Message</h3>
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {status.text && (
            <div style={{ color: status.type === "error" ? "red" : "green", fontSize: "0.875rem" }}>
              {status.text}
            </div>
          )}
          <input
            type="email"
            placeholder="Recipient's Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.75rem", borderRadius: "0.25rem", border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
          />
          <textarea
            placeholder="Write your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            required
            style={{ padding: "0.75rem", borderRadius: "0.25rem", border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)", resize: "vertical" }}
          />
          <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: "flex-end" }}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Inbox */}
      <div>
        <h2 style={{ marginBottom: "1rem" }}>Inbox</h2>
        {messages.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Your inbox is empty.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ border: "1px solid var(--border)", padding: "1.5rem", borderRadius: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "var(--accent)" }}>From: {msg.sender.name || msg.sender.email}</strong>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
