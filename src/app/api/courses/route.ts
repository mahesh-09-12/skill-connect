
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: true,
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
  }
}
