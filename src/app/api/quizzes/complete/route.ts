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
    const { quizId, score } = await req.json();

    // Reward: 5 coins for passing (score >= 70)
    if (score < 70) {
      return NextResponse.json({ message: 'Quiz completed, but score too low for reward.', earned: 0 });
    }

    const rewardAmount = 25;

    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.userId },
        data: {
          coinBalance: {
            increment: rewardAmount,
          },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: decoded.userId,
          amount: rewardAmount,
          type: 'EARN',
          reason: `Completed Quiz: ${quizId}`,
        },
      }),
    ]);

    return NextResponse.json({ 
      message: 'Great job! You earned coins.', 
      earned: rewardAmount,
      newBalance: result[0].coinBalance 
    });
  } catch (error: any) {
    console.error('Quiz reward error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
