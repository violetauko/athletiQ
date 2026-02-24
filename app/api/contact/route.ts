import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Get admin users to send messages to (you can modify this logic)
async function getAdminUsers() {
  return await prisma.user.findMany({
    where: { role: "ADMIN" }
  });
}

// Generate a temporary password for new users
function generateTempPassword() {
  return randomBytes(16).toString('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create a new user (they can set password later via "forgot password")
      user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role: "ATHLETE", // Default role, can be changed later
          password: generateTempPassword(), // You might want to hash this
          // You might want to send a welcome email with password setup link
        }
      });
    }

    // Get admin users to send the message to
    const admins = await getAdminUsers();
    
    if (admins.length === 0) {
      // If no admins found, create a default admin? Or handle error
      return NextResponse.json(
        { error: "No admin users found to receive messages" },
        { status: 500 }
      );
    }

    // Create messages for each admin (or you could create a single message for a default admin)
    const messages = await prisma.$transaction(
      admins.map(admin => 
        prisma.message.create({
          data: {
            senderId: user.id,
            receiverId: admin.id,
            content: JSON.stringify({
              subject,
              message,
              phone: phone || null,
              name: `${firstName} ${lastName}`,
              email
            }),
            isRead: false
          }
        })
      )
    );

    // You might also want to store the contact form submission separately
    // for better tracking
    await prisma.contactSubmission.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        userId: user.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully",
      messageCount: messages.length 
    });

  } catch (error) {
    console.error("[CONTACT_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}