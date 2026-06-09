import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/workouts/sets
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workoutExerciseId, setNumber, reps, weightKg } = await req.json();

  const set = await prisma.workoutSet.create({
    data: {
      workoutExerciseId,
      setNumber: Number(setNumber),
      reps: Number(reps),
      weightKg: Number(weightKg),
    }
  });

  return NextResponse.json({ set });
}
