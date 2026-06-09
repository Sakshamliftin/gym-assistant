import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/profile — fetch current user's profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}

// PATCH /api/profile — create or update profile
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    age,
    gender,
    heightCm,
    weightKg,
    fitnessGoal,
    experienceLevel,
    workoutFrequency,
    medicalNotes,
    preferences,
    onboardingDone,
  } = body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        age: age ? Number(age) : null,
        gender: gender ?? null,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        fitnessGoal: fitnessGoal ?? null,
        experienceLevel: experienceLevel ?? null,
        workoutFrequency: workoutFrequency ? Number(workoutFrequency) : null,
        medicalNotes: medicalNotes ?? null,
        preferences: preferences ? JSON.stringify(preferences) : null,
        onboardingDone: onboardingDone ?? false,
      },
      update: {
        age: age !== undefined ? Number(age) : undefined,
        gender: gender ?? undefined,
        heightCm: heightCm !== undefined ? Number(heightCm) : undefined,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        fitnessGoal: fitnessGoal ?? undefined,
        experienceLevel: experienceLevel ?? undefined,
        workoutFrequency:
          workoutFrequency !== undefined ? Number(workoutFrequency) : undefined,
        medicalNotes: medicalNotes ?? undefined,
        preferences: preferences ? JSON.stringify(preferences) : undefined,
        onboardingDone: onboardingDone ?? undefined,
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Profile Upsert Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upsert profile" }, { status: 500 });
  }
}
