import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages — Fetch inbox (received messages)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: { name: true, email: true }
      }
    }
  });

  return NextResponse.json({ messages });
}

// POST /api/messages — Send a message by receiver email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, content } = await req.json();

  if (!email || !content) {
    return NextResponse.json({ error: "Recipient email and content are required." }, { status: 400 });
  }

  // Find recipient by email
  const receiver = await prisma.user.findUnique({
    where: { email }
  });

  if (!receiver) {
    return NextResponse.json({ error: "User with that email not found." }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId: receiver.id,
      content,
    }
  });

  return NextResponse.json({ message });
}
