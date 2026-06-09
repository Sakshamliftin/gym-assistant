import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/workouts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        include: { exercise: true, sets: true }
      }
    }
  });

  return NextResponse.json({ workouts });
}

// POST /api/workouts
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, notes } = await req.json();

  const workout = await prisma.workout.create({
    data: {
      userId: session.user.id,
      name: name || "New Workout",
      notes: notes || "",
    },
  });

  return NextResponse.json({ workout });
}
