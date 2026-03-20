import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @fileOverview Handles lesson record creation in the database.
 * Now expects videoUrl to be provided (from Cloudinary).
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moduleId, title, description, duration, videoUrl } = body;

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Lesson title required" },
        { status: 400 }
      );
    }

    const count = await prisma.lesson.count({
      where: { moduleId }
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: title,
        description: description || "",
        moduleId,
        order: count + 1,
        duration: duration || "0:00",
        videoUrl: videoUrl || null,
      }
    });

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("Lesson creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
