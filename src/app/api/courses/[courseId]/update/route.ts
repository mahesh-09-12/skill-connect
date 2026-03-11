import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  priceInCoins: z.number().min(0),
  level: z.string(),
  language: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    if (course.instructorId !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: validatedData,
    });

    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('Course update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
