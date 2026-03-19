import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * Alternative enrollment route using path parameters.
 * Note: The existing UI currently uses /api/courses/enroll with a JSON body.
 */
export async function POST(
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
    const userId = decoded.userId;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: 'Already enrolled' }, { status: 400 });
    }

    if (user.coinBalance < course.priceInCoins) {
      return NextResponse.json({ message: 'Insufficient coins' }, { status: 400 });
    }

    const result = await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          coinBalance: {
            decrement: course.priceInCoins,
          },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          amount: -course.priceInCoins,
          type: 'SPEND',
          reason: `Enrolled in course: ${course.title}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, enrollment: result[0] });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
