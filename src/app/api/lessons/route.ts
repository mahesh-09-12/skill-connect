import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const moduleId = formData.get("moduleId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const duration = (formData.get("duration") as string) || "0:00";
    const videoFile = formData.get("video") as File | null;

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

    let videoUrl = "";

    if (videoFile && videoFile instanceof File) {
      const filename = `${Date.now()}-${videoFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure the uploads directory exists inside public
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Convert File to Buffer and write to filesystem
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filePath, buffer);
      
      // Store relative URL for public access
      videoUrl = `/uploads/${filename}`;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: title,
        description: description || "",
        moduleId,
        order: count + 1,
        duration: duration,
        videoUrl: videoUrl || null,
      }
    });

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("Lesson creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
