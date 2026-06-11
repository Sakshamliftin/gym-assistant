import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    return NextResponse.json({ error: "Gemini API key is missing or invalid." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Fetch context: profile and recent workouts
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const recentWorkouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      exercises: {
        include: { exercise: true, sets: true }
      }
    }
  });

  // Check if profile is filled in
  const hasProfile = profile && (profile.fitnessGoal || profile.age || profile.experienceLevel);

  // Construct context string
  const context = hasProfile
    ? `
You are an expert AI fitness coach for this user. You already know their profile — do NOT ask them for information you already have.

User Profile:
- Age: ${profile.age ?? 'Not specified'}
- Gender: ${profile.gender ?? 'Not specified'}
- Fitness Goal: ${profile.fitnessGoal ?? 'Not specified'}
- Experience Level: ${profile.experienceLevel ?? 'Not specified'}
- Workout Frequency: ${profile.workoutFrequency ? `${profile.workoutFrequency}x per week` : 'Not specified'}
- Height: ${profile.heightCm ? `${profile.heightCm} cm` : 'Not specified'}
- Weight: ${profile.weightKg ? `${profile.weightKg} kg` : 'Not specified'}
- Medical Notes: ${profile.medicalNotes || 'None'}

Recent Workouts (last 3):
${recentWorkouts.length > 0
  ? recentWorkouts.map(w => `- ${w.name}: ${w.exercises.map(we => we.exercise.name).join(", ")}`).join('\n')
  : 'No recent workouts logged yet.'}

Use the profile data above to give personalised, specific, and concise fitness advice. Reference their goal and experience level naturally in your response.
`
    : `
You are a friendly AI fitness coach. This user has not completed their profile setup yet.
Kindly let them know that to give personalised advice, they should complete their fitness profile first by visiting the Onboarding page (they can find an "Edit Profile" link on their dashboard).
You can still answer general fitness questions, but make it clear the advice is generic since you don't know their specific goals or experience.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: context + "\n\nUser Question: " + message,
      config: {
        // 1. Force the model to output valid JSON
        responseMimeType: 'application/json',
        // 2. Define exactly what you want the JSON object to look like
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The coach's response to the user, strictly plain text with NO markdown symbols like **, *, or #."
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of next steps for the user."
            }
          },
          required: ["reply"],
        },
      },
    });

    if (!response.text) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const coachData = JSON.parse(response.text);
    return Response.json(coachData);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
