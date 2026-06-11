"use client";

const features = [
  {
    icon: "🏋️",
    title: "Workout Logging",
    description:
      "Log every set, rep, and weight with a fast, minimal interface. Build your complete training history in seconds.",
  },
  {
    icon: "🤖",
    title: "AI Fitness Coach",
    description:
      "Chat with an AI that knows your history, goals, and injuries. Get personalized plans, form tips, and real-time feedback.",
  },
  {
    icon: "📈",
    title: "Progress Insights",
    description:
      "Automatically detect new PRs, strength trends, muscle-group gaps, and consistency patterns. Know exactly where you stand.",
  },
  {
    icon: "🦵",
    title: "Skip-Day Detection",
    description:
      "Forgotten leg day? GymBuddy tracks muscle-group coverage and calls you out — then suggests how to fix it.",
  },
  {
    icon: "🌍",
    title: "Creator Communities",
    description:
      "Subscribe to elite coaches and fitness creators. Follow their programs, updates, and community workouts.",
  },
  {
    icon: "💬",
    title: "Direct Messaging",
    description:
      "Message athletes and coaches directly. Keep the conversation focused — no noise, no algorithm.",
  },
];

export default function FeaturesGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {features.map((f) => (
        <div
          key={f.title}
          className="card feature-card"
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            {f.title}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            {f.description}
          </p>
        </div>
      ))}
    </div>
  );
}
