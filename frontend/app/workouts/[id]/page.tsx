"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ActiveWorkoutPage() {
  const { id } = useParams() as { id: string };
  const [workout, setWorkout] = useState<any>(null);
  const [newExercise, setNewExercise] = useState("");
  
  // Set logging states
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const fetchWorkout = async () => {
    const res = await fetch("/api/workouts");
    const data = await res.json();
    const current = data.workouts.find((w: any) => w.id === id);
    setWorkout(current);
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const addExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/workouts/${id}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseName: newExercise }),
    });
    setNewExercise("");
    fetchWorkout();
  };

  const logSet = async (e: React.FormEvent, workoutExerciseId: string) => {
    e.preventDefault();
    await fetch("/api/workouts/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workoutExerciseId,
        setNumber: 1, // Simplified for minimal UI
        reps,
        weightKg: weight,
      }),
    });
    setReps("");
    setWeight("");
    setActiveExerciseId(null);
    fetchWorkout();
  };

  if (!workout) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{workout.name}</h1>
      
      <form onSubmit={addExercise} style={{ margin: "1rem 0" }}>
        <input 
          type="text" 
          placeholder="Add Exercise (e.g. Bench Press)" 
          value={newExercise} 
          onChange={(e) => setNewExercise(e.target.value)} 
          required 
        />
        <button type="submit">Add</button>
      </form>

      <div>
        {workout.exercises.map((we: any) => (
          <div key={we.id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0" }}>
            <h3>{we.exercise.name}</h3>
            
            <ul style={{ margin: "0.5rem 0" }}>
              {we.sets.map((s: any, idx: number) => (
                <li key={s.id}>
                  Set {idx + 1}: {s.reps} reps @ {s.weightKg}kg
                </li>
              ))}
            </ul>

            {activeExerciseId === we.id ? (
              <form onSubmit={(e) => logSet(e, we.id)} style={{ marginTop: "0.5rem" }}>
                <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} required style={{ width: "60px", marginRight: "0.5rem" }}/>
                <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} required style={{ width: "80px", marginRight: "0.5rem" }}/>
                <button type="submit">Save Set</button>
                <button type="button" onClick={() => setActiveExerciseId(null)}>Cancel</button>
              </form>
            ) : (
              <button onClick={() => setActiveExerciseId(we.id)}>+ Log Set</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
