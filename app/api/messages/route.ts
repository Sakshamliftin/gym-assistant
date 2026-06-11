import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages — Fetch all chats (sent and received messages)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, username: true, email: true }
      },
      receiver: {
        select: { id: true, name: true, username: true, email: true }
      }
    }
  });

  return NextResponse.json({ messages });
}

// POST /api/messages — Send a message by receiver username
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, content } = await req.json();

  if (!username || !content) {
    return NextResponse.json(
      { error: "Recipient username and content are required." },
      { status: 400 }
    );
  }

  const targetUsername = username.trim().toLowerCase();

  // Find recipient by username
  const receiver = await prisma.user.findUnique({
    where: { username: targetUsername }
  });

  if (!receiver) {
    return NextResponse.json(
      { error: "User with that username not found." },
      { status: 404 }
    );
  }

  if (receiver.id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot message yourself." },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId: receiver.id,
      content,
    },
    include: {
      sender: {
        select: { id: true, name: true, username: true, email: true }
      },
      receiver: {
        select: { id: true, name: true, username: true, email: true }
      }
    }
  });

  return NextResponse.json({ message });
}
