import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { TransactionType } from '@prisma/client';

/**
 * @fileOverview Handles the daily coin reward logic.
 * Prevents multiple claims per day and ensures transaction records are created.
 */

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

    // Check if user already claimed a daily reward in the last 24 hours
    const lastTransaction = await prisma.coinTransaction.findFirst({
      where: {
        userId: userId,
        type: TransactionType.DAILY_REWARD,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lastTransaction) {
      const lastCheckinTime = new Date(lastTransaction.createdAt).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (now - lastCheckinTime < twentyFourHours) {
        return NextResponse.json({ message: 'Come back tomorrow' }, { status: 400 });
      }
    }

    const rewardAmount = 25; // Standard daily reward

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
          type: TransactionType.DAILY_REWARD,
          reason: 'Daily Check-in Reward',
        },
      }),
    ]);

    return NextResponse.json({ 
      message: 'Daily reward collected!', 
      newBalance: result[0].coinBalance 
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ message: 'Failed to claim reward. Please try again later.' }, { status: 500 });
  }
}
