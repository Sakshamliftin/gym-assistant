"use client";

import { useState } from "react";

type ChatLogEntry = {
  role: "user" | "coach" | "error";
  text: string;
  actionItems?: string[];
};

export default function CoachPage() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setChatLog((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();

      if (res.ok) {
        setChatLog((prev) => [
          ...prev,
          {
            role: "coach",
            text: data.reply,
            actionItems: Array.isArray(data.actionItems)
              ? data.actionItems
              : [],
          },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            role: "error",
            text: data.error || "Failed to fetch response.",
            actionItems: Array.isArray(data.actionItems)
              ? data.actionItems
              : [],
          },
        ]);
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { role: "error", text: "Network error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>AI Fitness Coach</h1>
      <p style={{ marginBottom: "1rem" }}>
        Ask me anything about your training, goals, or form!
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "400px",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        {chatLog.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No messages yet.</p>
        ) : (
          chatLog.map((log, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                textAlign: log.role === "user" ? "right" : "left",
              }}
            >
              <strong
                style={{
                  color:
                    log.role === "error"
                      ? "red"
                      : log.role === "user"
                        ? "var(--accent)"
                        : "var(--text-primary)",
                }}
              >
                {log.role === "user"
                  ? "You: "
                  : log.role === "error"
                    ? "Error: "
                    : "Coach: "}
              </strong>
              <div style={{ whiteSpace: "pre-wrap", marginTop: "0.25rem" }}>
                {log.text}
                {log.actionItems && log.actionItems.length > 0 && (
                  <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
                    {log.actionItems.map((item, actionIndex) => (
                      <li key={actionIndex}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <p style={{ color: "var(--text-muted)" }}>Coach is thinking...</p>
        )}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          style={{ padding: "0.5rem 1rem" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
