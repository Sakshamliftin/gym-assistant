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

  // Construct context string
  const context = `
You are an expert AI fitness coach for this user.
Profile Context:
- Age: ${profile?.age || 'Unknown'}
- Gender: ${profile?.gender || 'Unknown'}
- Goal: ${profile?.fitnessGoal || 'Unknown'}
- Experience: ${profile?.experienceLevel || 'Unknown'}
- Medical Notes: ${profile?.medicalNotes || 'None'}

Recent Workouts Context (last 3):
${recentWorkouts.map(w => `- ${w.name}: ${w.exercises.map(we => we.exercise.name).join(", ")}`).join('\n')}

Based on this context, provide helpful, concise, and safe fitness advice.
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
