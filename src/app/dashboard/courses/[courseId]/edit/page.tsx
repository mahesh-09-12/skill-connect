import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as jose from "jose";
import CourseEditForm from "@/components/course-edit-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId as string;
  } catch (error) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  if (course.instructorId !== userId) {
    redirect("/dashboard/courses");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Course Details</h1>
        <p className="text-muted-foreground">Modify the basic information of your course.</p>
      </div>
      <CourseEditForm course={course} />
    </div>
  );
}
