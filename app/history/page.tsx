"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HistoryPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading stats...</div>;
  if (!stats || stats.error) return <div style={{ padding: "2rem" }}>Error loading stats.</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Performance & History</h1>
      
      <div style={{ display: "flex", gap: "1rem", margin: "2rem 0" }}>
        <div style={{ flex: 1, padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "0.5rem" }}>
          <h3 style={{ margin: 0, color: "var(--text-secondary)" }}>Total Workouts</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0 0" }}>{stats.totalWorkouts}</p>
        </div>
        <div style={{ flex: 1, padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "0.5rem" }}>
          <h3 style={{ margin: 0, color: "var(--text-secondary)" }}>Total Volume</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0 0" }}>{stats.totalVolume} kg</p>
        </div>
        <div style={{ flex: 1, padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "0.5rem" }}>
          <h3 style={{ margin: 0, color: "var(--text-secondary)" }}>Sets Logged</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0 0" }}>{stats.totalSets}</p>
        </div>
      </div>

      <h2>Recent Workouts</h2>
      {stats.recentWorkouts.length === 0 ? (
        <p>No workouts recorded yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {stats.recentWorkouts.map((workout: any) => (
            <li key={workout.id} style={{ border: "1px solid var(--border)", padding: "1rem", margin: "1rem 0", borderRadius: "0.5rem" }}>
              <h3 style={{ margin: "0 0 0.5rem" }}>{workout.name}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "0 0 1rem" }}>
                {new Date(workout.createdAt).toLocaleDateString()}
              </p>
              
              <Link href={`/workouts/${workout.id}`} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                View / Edit Workout
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      <div style={{ marginTop: "2rem" }}>
         <Link href="/dashboard" className="btn-secondary">
           ← Back to Dashboard
         </Link>
      </div>
    </div>
  );
}
