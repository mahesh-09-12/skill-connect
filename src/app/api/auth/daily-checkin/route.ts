import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user already checked in today
    const lastTransaction = await prisma.coinTransaction.findFirst({
      where: {
        userId: userId,
        type: 'EARN',
        reason: 'Daily Check-in',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lastTransaction) {
      const lastCheckinDate = new Date(lastTransaction.createdAt).toDateString();
      const todayDate = new Date().toDateString();
      if (lastCheckinDate === todayDate) {
        return NextResponse.json({ message: 'Already checked in today' }, { status: 400 });
      }
    }

    const rewardAmount = 10;

    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          coinBalance: {
            increment: rewardAmount,
          },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: userId,
          amount: rewardAmount,
          type: 'EARN',
          reason: 'Daily Check-in',
        },
      }),
    ]);

    return NextResponse.json({ 
      message: 'Daily reward collected!', 
      newBalance: result[0].coinBalance 
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
