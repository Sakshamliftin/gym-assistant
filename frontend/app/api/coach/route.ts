import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

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
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: context + "\n\nUser Question: " + message }] }
      ]
    });
    
    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
