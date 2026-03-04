import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";
import { sendEmail } from "@/lib/email/email-service";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const allowedRoles: UserRole[] = ["ATHLETE", "CLIENT", "ADMIN"];
  const assignedRole: UserRole =
    role && allowedRoles.includes(role) ? role : "ATHLETE";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  const verificationToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

  await prisma.verificationToken.create({
    data: {
      identifier: verificationToken,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  });
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Athletic Performance Agency! 🎉',
    template: 'registration-confirmation',
    data: {
      name: user.name,
      email: user.email,
      userType: user.role,
      verificationLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
