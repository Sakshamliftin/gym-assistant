"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkoutPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const startWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.workout) {
      router.push(`/workouts/${data.workout.id}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Start New Workout</h1>
      <form onSubmit={startWorkout} style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Workout Name (e.g. Leg Day)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ display: "block", marginBottom: "1rem", padding: "0.5rem" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Starting..." : "Start Workout"}
        </button>
      </form>
    </div>
  );
}
