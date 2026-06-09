import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all workouts with their exercises and sets
  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true
        }
      }
    }
  });

  // Calculate basic stats
  const totalWorkouts = workouts.length;
  
  let totalVolume = 0;
  let totalSets = 0;

  workouts.forEach(workout => {
    workout.exercises.forEach(we => {
      we.sets.forEach(set => {
        totalSets++;
        if (set.weightKg && set.reps) {
          totalVolume += (set.weightKg * set.reps);
        }
      });
    });
  });

  return NextResponse.json({
    totalWorkouts,
    totalVolume,
    totalSets,
    recentWorkouts: workouts.slice(0, 5) // Send the 5 most recent for the UI
  });
}
