"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";

type ExerciseGen = {
  name: string;
  muscleGroup: string;
  setsCount: number;
  repsRange: string;
  coachingTips?: string;
};

type GeneratedWorkout = {
  workoutName: string;
  notes: string;
  exercises: ExerciseGen[];
};

export default function RoutineGeneratorPage() {
  const router = useRouter();
  const [split, setSplit] = useState("full-body");
  const [duration, setDuration] = useState("45");
  const [focus, setFocus] = useState("hypertrophy");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/workouts/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ split, duration: parseInt(duration, 10), focus }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to generate routine. Please check your Gemini API key.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred while generating your routine.");
    } finally {
      setLoading(false);
    }
  };

  const importWorkout = async () => {
    if (!result) return;
    setImporting(true);
    setError(null);

    try {
      const res = await fetch("/api/workouts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutName: result.workoutName,
          notes: result.notes,
          exercises: result.exercises,
        }),
      });

      const data = await res.json();
      if (res.ok && data.workoutId) {
        router.push(`/workouts/${data.workoutId}`);
      } else {
        setError(data.error || "Failed to save workout to database.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred while saving your workout.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "3rem 1.5rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            🤖 AI <span className="gradient-text">Routine Generator</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: "550px", margin: "0 auto" }}>
            Let the AI Coach design a personalized, time-optimized training session tailored to your current fitness goals and physical profile.
          </p>
        </div>

        {error && (
          <div style={{
            padding: "1rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--error)",
            borderRadius: "0.75rem",
            color: "var(--error)",
            marginBottom: "2rem",
            fontSize: "0.9375rem"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Input Form Section */}
        {!result && !loading && (
          <form onSubmit={generateRoutine} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Split */}
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Choose Training Split
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
                {[
                  { value: "full-body", label: "🌍 Full Body" },
                  { value: "push", label: "🔥 Push (Chest/Tri)" },
                  { value: "pull", label: "⚡ Pull (Back/Bi)" },
                  { value: "legs", label: "🦵 Leg Day" },
                  { value: "core", label: "🎯 Core & Abs" }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSplit(item.value)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      border: split === item.value ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: split === item.value ? "var(--accent-muted)" : "var(--bg-surface)",
                      color: split === item.value ? "var(--accent)" : "var(--text-primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Workout Duration
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                {["30", "45", "60", "90"].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      border: duration === mins ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: duration === mins ? "var(--accent-muted)" : "var(--bg-surface)",
                      color: duration === mins ? "var(--accent)" : "var(--text-primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    ⏱️ {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Training Focus */}
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                Training Focus
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                {[
                  { value: "hypertrophy", label: "💪 Hypertrophy (Muscle Build)" },
                  { value: "strength", label: "🏋️ Max Strength (Low Reps)" },
                  { value: "endurance", label: "🏃 Endurance & Cardio" },
                  { value: "mobility", label: "🧘 Mobility & Joint Health" }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFocus(item.value)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      border: focus === item.value ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: focus === item.value ? "var(--accent-muted)" : "var(--bg-surface)",
                      color: focus === item.value ? "var(--accent)" : "var(--text-primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s"
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: "1rem", marginTop: "1rem", fontSize: "1.05rem" }}>
              ⚡ Generate Personalized Routine
            </button>
          </form>
        )}

        {/* Loading Spinner / Skeleton */}
        {loading && (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "4px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            ` }} />
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>Coach is planning your routine...</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                Analyzing profile metrics, choosing exercises, and pacing duration.
              </p>
            </div>
          </div>
        )}

        {/* Generated Workout Result Screen */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", padding: "0.25rem 0.50rem", borderRadius: "999px", letterSpacing: "0.05em" }}>
                    AI Recommended Routine
                  </span>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }}>
                    {result.workoutName}
                  </h2>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500, display: "flex", gap: "1rem" }}>
                  <span>⏱️ {duration} min</span>
                  <span style={{ textTransform: "capitalize" }}>🎯 {focus}</span>
                </div>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.95rem", whiteSpace: "pre-wrap", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                <strong>Coach Notes:</strong> {result.notes}
              </p>
            </div>

            {/* Exercises List */}
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                Exercises ({result.exercises.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {result.exercises.map((ex, idx) => (
                  <div key={idx} className="card" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div style={{
                      background: "var(--bg-elevated)",
                      color: "var(--accent)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{ex.name}</h4>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.75rem", background: "var(--bg-elevated)", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                            {ex.muscleGroup}
                          </span>
                          <span style={{ fontSize: "0.75rem", background: "rgba(108,99,255,0.1)", color: "var(--accent)", padding: "0.15rem 0.5rem", borderRadius: "0.375rem", fontWeight: 600 }}>
                            {ex.setsCount} sets × {ex.repsRange}
                          </span>
                        </div>
                      </div>
                      {ex.coachingTips && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
                          💡 <em>Form tip:</em> {ex.coachingTips}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="btn-secondary"
                disabled={importing}
              >
                🔄 Try Another Setup
              </button>
              <button
                type="button"
                onClick={importWorkout}
                className="btn-primary"
                disabled={importing}
                style={{ padding: "0.75rem 2rem" }}
              >
                {importing ? "Saving Workout..." : "🚀 Import & Start Workout"}
              </button>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
