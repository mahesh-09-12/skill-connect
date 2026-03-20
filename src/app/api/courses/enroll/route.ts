import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * @fileOverview Handles course enrollment with atomic coin transfers and transaction logging.
 */

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User account not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: 'You are already enrolled in this course' }, { status: 400 });
    }

    // Check coin balance
    if (user.coinBalance < course.priceInCoins) {
      return NextResponse.json({ 
        message: `Insufficient coins. This course costs ${course.priceInCoins} coins but you only have ${user.coinBalance}.` 
      }, { status: 400 });
    }

    // Atomic transaction for enrollment and dual-sided coin transfer + record keeping
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          progress: 0,
        },
      });

      // 2. Deduct from Learner
      const updatedLearner = await tx.user.update({
        where: { id: user.id },
        data: {
          coinBalance: {
            decrement: course.priceInCoins,
          },
        },
      });

      // 3. Create Learner Transaction Record
      await tx.coinTransaction.create({
        data: {
          userId: user.id,
          amount: -course.priceInCoins,
          type: 'SPEND',
          reason: `Enrolled in course: ${course.title}`,
        },
      });

      // 4. Pay Instructor (unless it's a free course)
      if (course.priceInCoins > 0) {
        await tx.user.update({
          where: { id: course.instructorId },
          data: {
            coinBalance: {
              increment: course.priceInCoins,
            },
          },
        });

        await tx.coinTransaction.create({
          data: {
            userId: course.instructorId,
            amount: course.priceInCoins,
            type: 'EARN',
            reason: `Sold course: ${course.title}`,
          },
        });
      }

      return { enrollment, updatedLearner };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled!', 
      enrollment: result.enrollment,
      newBalance: result.updatedLearner.coinBalance 
    });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred during enrollment' }, { status: 500 });
  }
}
