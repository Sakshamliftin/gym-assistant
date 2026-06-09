import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/workouts/[id]/exercises
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId } = await params;
  const { exerciseName, muscleGroup } = await req.json();

  // Find or create the master exercise
  let exercise = await prisma.exercise.findUnique({ where: { name: exerciseName } });
  if (!exercise) {
    exercise = await prisma.exercise.create({
      data: { name: exerciseName, muscleGroup: muscleGroup || "general" }
    });
  }

  const workoutExercise = await prisma.workoutExercise.create({
    data: {
      workoutId,
      exerciseId: exercise.id,
      order: 0,
    },
    include: { exercise: true, sets: true }
  });

  return NextResponse.json({ workoutExercise });
}
