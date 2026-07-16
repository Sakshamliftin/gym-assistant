import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workoutName, notes, exercises } = await req.json();

  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return NextResponse.json({ error: "Invalid exercises data." }, { status: 400 });
  }

  try {
    // Create the main Workout record in a transaction (or sequential operations)
    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        name: workoutName || "AI Generated Workout",
        notes: notes || "",
      },
    });

    // Process exercises sequentially to maintain order and link everything
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];

      // Find or create the master Exercise
      let exerciseRecord = await prisma.exercise.findUnique({
        where: { name: ex.name },
      });

      if (!exerciseRecord) {
        exerciseRecord = await prisma.exercise.create({
          data: {
            name: ex.name,
            muscleGroup: ex.muscleGroup || "general",
          },
        });
      }

      // Create the WorkoutExercise join record
      const workoutExercise = await prisma.workoutExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId: exerciseRecord.id,
          order: i,
        },
      });

      // Parse suggested reps if possible
      const repsMatch = ex.repsRange ? ex.repsRange.match(/\d+/) : null;
      const suggestedReps = repsMatch ? parseInt(repsMatch[0], 10) : null;

      // Pre-create the suggested sets
      const setsCount = ex.setsCount || 3;
      for (let s = 1; s <= setsCount; s++) {
        await prisma.workoutSet.create({
          data: {
            workoutExerciseId: workoutExercise.id,
            setNumber: s,
            reps: suggestedReps,
            weightKg: null, // User will enter this during their workout
            notes: s === 1 ? `${ex.repsRange || ""}. Tips: ${ex.coachingTips || ""}` : "",
          },
        });
      }
    }

    return NextResponse.json({ success: true, workoutId: workout.id });
  } catch (error: any) {
    console.error("Workout Import Error:", error);
    return NextResponse.json({ error: "Failed to import workout routine." }, { status: 500 });
  }
}
