import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/community — Fetch a feed of all posts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // For the minimal MVP, we just fetch all posts in chronological order
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }
    },
    take: 50
  });

  return NextResponse.json({ posts });
}

// POST /api/community — Create a new post (assuming the user is a creator)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure the user has a creator profile; if not, create a dummy one for the demo
  let creator = await prisma.creator.findUnique({
    where: { userId: session.user.id }
  });

  if (!creator) {
    creator = await prisma.creator.create({
      data: {
        userId: session.user.id,
        displayName: session.user.name || "Unknown Creator",
        bio: "Fitness enthusiast",
      }
    });
  }

  const { content, title } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      creatorId: creator.id,
      title: title || null,
      content,
    }
  });

  return NextResponse.json({ post });
}
