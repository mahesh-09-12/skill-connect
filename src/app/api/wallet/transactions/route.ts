import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { TransactionType } from '@prisma/client';

/**
 * @fileOverview Fetches transaction history for the authenticated user.
 * Uses proper chronological ordering by createdAt.
 */

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    let transactions = await prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Fallback: If no transactions found but user has balance, create signup bonus entry
    if (transactions.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { coinBalance: true }
      });

      if (user && user.coinBalance > 0) {
        await prisma.coinTransaction.create({
          data: {
            userId,
            amount: user.coinBalance,
            type: TransactionType.SIGNUP_BONUS,
            reason: 'Account Opening Balance',
          }
        });

        // Re-fetch transactions
        transactions = await prisma.coinTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50
        });
      }
    }

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Wallet history fetch error:', error);
    return NextResponse.json({ message: 'Failed to load transaction history' }, { status: 500 });
  }
}
