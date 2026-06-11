import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, username, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Clean username (lowercase, alphanumeric + underscores/dashes)
    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, underscores, and dashes." },
        { status: 400 }
      );
    }

    // Check if user already exists with email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: cleanUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || cleanUsername,
        username: cleanUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
        profile: {
          create: {
            onboardingDone: false
          }
        }
      }
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
