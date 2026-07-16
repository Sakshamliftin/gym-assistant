import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { split, duration, focus } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Retrieve user profile to personalize the generated routine
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  const hasProfile = profile && (profile.fitnessGoal || profile.age || profile.experienceLevel);

  const userContext = hasProfile
    ? `
User Profile:
- Age: ${profile.age ?? "Not specified"}
- Gender: ${profile.gender ?? "Not specified"}
- Overall Goal: ${profile.fitnessGoal ?? "Not specified"}
- Experience Level: ${profile.experienceLevel ?? "Not specified"}
- Height: ${profile.heightCm ? `${profile.heightCm} cm` : "Not specified"}
- Weight: ${profile.weightKg ? `${profile.weightKg} kg` : "Not specified"}
- Medical/Injury Notes: ${profile.medicalNotes || "None"}
`
    : "User Profile: Not completed yet (default to intermediate level, no injuries).";

  const prompt = `
You are an elite, certified AI Fitness Coach and Personal Trainer.
Generate a custom, highly optimized, and safe workout routine based on the following choices:
- Workout Split/Target Area: ${split}
- Workout Duration: ${duration} minutes
- Training Focus: ${focus}

User Personal Context:
${userContext}

Design the workout so that it fits exactly within the target duration (${duration} minutes). Ensure the exercises chosen are appropriate for their experience level (${profile?.experienceLevel ?? "intermediate"}) and take into account any medical/injury notes (if any).

Provide a creative name for this workout (e.g. "Iron Chest Shred", "Hypertrophy Push Day", "Ankle & Hip Mobility Flow"). Provide a brief description/notes from you as the coach, and details for each exercise including suggested sets (integer) and target reps/ranges (e.g., "8-10 reps", "12 reps", "30-45 sec hold").
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workoutName: {
              type: Type.STRING,
              description: "A motivating and creative title for this workout session.",
            },
            notes: {
              type: Type.STRING,
              description: "Brief coaching notes, dynamic warmup advice, or focus instructions for this workout.",
            },
            exercises: {
              type: Type.ARRAY,
              description: "The list of exercises making up the routine. Should fit the duration.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Standard name of the exercise (e.g., Bench Press, Romanian Deadlift).",
                  },
                  muscleGroup: {
                    type: Type.STRING,
                    description: "Primary muscle group (e.g., chest, back, legs, shoulders, arms, core, cardio).",
                  },
                  setsCount: {
                    type: Type.INTEGER,
                    description: "Number of sets to perform (typically 2 to 5).",
                  },
                  repsRange: {
                    type: Type.STRING,
                    description: "Suggested rep count or duration target (e.g. '8-10 reps', '12 reps', '45s hold').",
                  },
                  coachingTips: {
                    type: Type.STRING,
                    description: "Form tips or breathing instructions specific to this exercise.",
                  },
                },
                required: ["name", "muscleGroup", "setsCount", "repsRange"],
              },
            },
          },
          required: ["workoutName", "notes", "exercises"],
        },
      },
    });

    if (!response.text) {
      return NextResponse.json({ error: "No response received from AI model." }, { status: 500 });
    }

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Routine Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate workout routine." }, { status: 500 });
  }
}
