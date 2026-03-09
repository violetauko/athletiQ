import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { EXPERIENCE_LEVELS, GENDERS } from "@/lib/enums";
const athleteProfileSchema = z.object({
    // Personal Information
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    names: z.string().optional(),
    dateOfBirth: z.coerce.date({
        error: 'Date of birth is required',
    }),
    gender: z.enum(GENDERS),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    profileImage: z.string().optional(),
    resumeUrl: z.url('Please enter a valid URL').optional().nullable(),

    // Physical Stats
    height: z.coerce.number().min(100, 'Height must be at least 100cm').max(250, 'Height must not exceed 250cm').optional(),
    weight: z.coerce.number().min(30, 'Weight must be at least 30kg').max(200, 'Weight must not exceed 200kg').optional(),

    // Sports Information
    primarySport: z.string().min(2, 'Primary sport is required'),
    position: z.string().optional(),
    experience: z.enum(EXPERIENCE_LEVELS).optional(),

    // Academic Information
    gpa: z.coerce.number().min(0).max(4).optional(),
    graduationYear: z.coerce.number().min(2000).max(2100).optional(),
    currentSchool: z.string().optional(),

    // Achievements and Media
    secondarySports: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    videoHighlights: z.array(z.string()).optional(),
});
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        User: {
          select: { name: true, email: true, image: true }
        }
      }
    });

    if (!athleteProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(athleteProfile);
  } catch (error) {
    console.error("[ATHLETE_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Check authentication and role
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ATHLETE") {
      return new NextResponse("Only athletes can create athlete profiles", { status: 403 });
    }

    // Check if profile already exists
    const existingProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (existingProfile) {
      return new NextResponse("Profile already exists. Use PATCH to update.", { status: 409 });
    }

    // Parse and validate request body
    const body = await req.json();
    
    try {
      const validatedData = athleteProfileSchema.parse(body);
      console.log("validated data: ",validatedData)
      
      // Create athlete profile
      const profile = await prisma.athleteProfile.create({
        data: {
          userId: session.user.id,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          dateOfBirth: new Date(validatedData.dateOfBirth),
          gender: validatedData.gender,
          phone: validatedData.phone,
          location: validatedData.location,
          bio: validatedData.bio,
          height: validatedData.height,
          weight: validatedData.weight,
          profileImage: validatedData.profileImage,
          resumeUrl: validatedData.resumeUrl,
          primarySport: validatedData.primarySport,
          secondarySports: validatedData.secondarySports,
          position: validatedData.position,
          experience: validatedData.experience,
          gpa: validatedData.gpa,
          graduationYear: validatedData.graduationYear,
          currentSchool: validatedData.currentSchool,
          achievements: validatedData.achievements,
          videoHighlights: validatedData.videoHighlights,
        },
        include: {
          User: {
            select: {
              name: true,
              email: true,
              image: true,
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: "Athlete profile created successfully",
        profile
      }, { status: 201 });

    } catch (validationError) {
      console.error("Validation error: ", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({
          error: "Validation failed",
          details: validationError?.message
        }, { status: 400 });
      }
      throw validationError;
    }

  } catch (error) {
    console.error("[ATHLETE_PROFILE_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH endpoint for updating existing profile
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Split user fields and profile fields
    const { name, email, image, ...profileData } = body;

    // Validate profile data if present
    if (Object.keys(profileData).length > 0) {
      try {
        // Create a partial schema for updates
        const partialSchema = athleteProfileSchema.partial();
        partialSchema.parse(profileData);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return NextResponse.json({
            error: "Validation failed",
            details: validationError.message
          }, { status: 400 });
        }
        throw validationError;
      }
    }

    // Check if profile exists
    const existingProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found. Use POST to create.", { status: 404 });
    }

    // Update profile and user in a transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update User if needed
      if (name || image) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            ...(name && { name }),
            ...(image && { image })
          }
        });
      }

      // Prepare profile update data
      const updateData: any = {};
      
      if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName;
      if (profileData.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(profileData.dateOfBirth);
      if (profileData.gender !== undefined) updateData.gender = profileData.gender;
      if (profileData.phone !== undefined) updateData.phone = profileData.phone;
      if (profileData.location !== undefined) updateData.location = profileData.location;
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.height !== undefined) updateData.height = profileData.height;
      if (profileData.weight !== undefined) updateData.weight = profileData.weight;
      if (profileData.profileImage !== undefined) updateData.profileImage = profileData.profileImage;
      if (profileData.resumeUrl !== undefined) updateData.resumeUrl = profileData.resumeUrl;
      if (profileData.primarySport !== undefined) updateData.primarySport = profileData.primarySport;
      if (profileData.secondarySports !== undefined) updateData.secondarySports = profileData.secondarySports;
      if (profileData.position !== undefined) updateData.position = profileData.position;
      if (profileData.experience !== undefined) updateData.experience = profileData.experience;
      if (profileData.gpa !== undefined) updateData.gpa = profileData.gpa;
      if (profileData.graduationYear !== undefined) updateData.graduationYear = profileData.graduationYear;
      if (profileData.currentSchool !== undefined) updateData.currentSchool = profileData.currentSchool;
      if (profileData.achievements !== undefined) updateData.achievements = profileData.achievements;
      if (profileData.videoHighlights !== undefined) updateData.videoHighlights = profileData.videoHighlights;

      // Update AthleteProfile
      return await tx.athleteProfile.update({
        where: { userId: session.user.id },
        data: updateData,
        include: {
          User: { select: { name: true, email: true, image: true } }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile
    });

  } catch (error) {
    console.error("[ATHLETE_PROFILE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE endpoint
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if profile exists
    const existingProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Delete profile (user account remains)
    await prisma.athleteProfile.delete({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully"
    });

  } catch (error) {
    console.error("[ATHLETE_PROFILE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}