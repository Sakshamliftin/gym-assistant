"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | 4;

interface OnboardingData {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  fitnessGoal: string;
  experienceLevel: string;
  workoutFrequency: string;
  medicalNotes: string;
}

const GOALS = [
  { value: "lose-weight", label: "🔥 Lose Weight" },
  { value: "build-muscle", label: "💪 Build Muscle" },
  { value: "maintain", label: "⚖️ Maintain Fitness" },
  { value: "endurance", label: "🏃 Improve Endurance" },
  { value: "general", label: "🎯 General Health" },
];

const EXPERIENCE = [
  { value: "beginner", label: "Beginner", desc: "Less than 1 year" },
  { value: "intermediate", label: "Intermediate", desc: "1–3 years" },
  { value: "advanced", label: "Advanced", desc: "3+ years" },
];

const FREQ = [1, 2, 3, 4, 5, 6, 7];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<OnboardingData>({
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    fitnessGoal: "",
    experienceLevel: "",
    workoutFrequency: "3",
    medicalNotes: "",
  });

  const set = (key: keyof OnboardingData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const back = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          age: data.age ? Number(data.age) : null,
          heightCm: data.heightCm ? Number(data.heightCm) : null,
          weightKg: data.weightKg ? Number(data.weightKg) : null,
          workoutFrequency: Number(data.workoutFrequency),
          onboardingDone: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      router.push("/dashboard");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: "540px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ color: "var(--accent)", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Step {step} of 4
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            {step === 1 && "About You"}
            {step === 2 && "Your Goals"}
            {step === 3 && "Your Experience"}
            {step === 4 && "Health Notes"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            {step === 1 && "Basic info to personalise your AI coach."}
            {step === 2 && "What are you training for?"}
            {step === 3 && "How experienced are you?"}
            {step === 4 && "Any injuries or conditions we should know about?"}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: "4px", background: "var(--bg-elevated)", borderRadius: "2px", marginBottom: "2rem" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--accent)",
            borderRadius: "2px",
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "2rem" }}>
          {error && (
            <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input id="onboard-age" type="number" min="10" max="100" value={data.age}
                    onChange={e => set("age", e.target.value)}
                    placeholder="e.g. 25" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gender (optional)</label>
                  <select id="onboard-gender" value={data.gender} onChange={e => set("gender", e.target.value)} style={inputStyle}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Height (cm)</label>
                  <input id="onboard-height" type="number" min="100" max="250" value={data.heightCm}
                    onChange={e => set("heightCm", e.target.value)}
                    placeholder="e.g. 175" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input id="onboard-weight" type="number" min="30" max="300" value={data.weightKg}
                    onChange={e => set("weightKg", e.target.value)}
                    placeholder="e.g. 75" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Goals ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {GOALS.map(g => (
                <button key={g.value} id={`goal-${g.value}`} type="button"
                  onClick={() => set("fitnessGoal", g.value)}
                  style={{
                    padding: "0.875rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: `1px solid ${data.fitnessGoal === g.value ? "var(--accent)" : "var(--border)"}`,
                    background: data.fitnessGoal === g.value ? "var(--accent-muted)" : "var(--bg-elevated)",
                    color: data.fitnessGoal === g.value ? "var(--accent)" : "var(--text-primary)",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Step 3: Experience + Frequency ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.75rem", display: "block" }}>Experience Level</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {EXPERIENCE.map(e => (
                    <button key={e.value} id={`exp-${e.value}`} type="button"
                      onClick={() => set("experienceLevel", e.value)}
                      style={{
                        padding: "0.875rem 1.25rem",
                        borderRadius: "0.75rem",
                        border: `1px solid ${data.experienceLevel === e.value ? "var(--accent)" : "var(--border)"}`,
                        background: data.experienceLevel === e.value ? "var(--accent-muted)" : "var(--bg-elevated)",
                        color: "var(--text-primary)",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{e.label}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{e.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ ...labelStyle, marginBottom: "0.75rem", display: "block" }}>
                  Target workout days per week:{" "}
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{data.workoutFrequency}</span>
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {FREQ.map(n => (
                    <button key={n} id={`freq-${n}`} type="button"
                      onClick={() => set("workoutFrequency", String(n))}
                      style={{
                        flex: 1,
                        padding: "0.625rem 0",
                        borderRadius: "0.5rem",
                        border: `1px solid ${data.workoutFrequency === String(n) ? "var(--accent)" : "var(--border)"}`,
                        background: data.workoutFrequency === String(n) ? "var(--accent)" : "var(--bg-elevated)",
                        color: data.workoutFrequency === String(n) ? "#fff" : "var(--text-secondary)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Medical / Notes ── */}
          {step === 4 && (
            <div>
              <label style={labelStyle}>Medical conditions, injuries, or anything your AI coach should know (optional)</label>
              <textarea
                id="onboard-medical"
                value={data.medicalNotes}
                onChange={e => set("medicalNotes", e.target.value)}
                placeholder="e.g. Lower back injury, avoid heavy deadlifts. Lactose intolerant..."
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "120px",
                  fontFamily: "inherit",
                }}
              />
              <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                This information is used only to personalise your AI fitness coach. You can update it anytime in your profile settings.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", gap: "1rem" }}>
          <button
            id="onboard-back"
            type="button"
            onClick={back}
            disabled={step === 1}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              background: "transparent",
              color: step === 1 ? "var(--text-muted)" : "var(--text-primary)",
              fontWeight: 600,
              cursor: step === 1 ? "not-allowed" : "pointer",
              opacity: step === 1 ? 0.4 : 1,
              transition: "all 0.15s",
            }}
          >
            ← Back
          </button>

          {step < 4 ? (
            <button id="onboard-next" type="button" onClick={next} className="btn-primary">
              Next →
            </button>
          ) : (
            <button id="onboard-finish" type="button" onClick={handleFinish} disabled={saving} className="btn-primary"
              style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Finish & Start Training →"}
            </button>
          )}
        </div>

        {/* Skip */}
        <p style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <button
            id="onboard-skip"
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.875rem", cursor: "pointer" }}
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: "0.5rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.625rem",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  fontSize: "0.9375rem",
  outline: "none",
  boxSizing: "border-box",
};
