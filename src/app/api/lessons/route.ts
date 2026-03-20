
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

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
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResponse: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "skillconnect_lessons",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      videoUrl = uploadResponse.secure_url;
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
