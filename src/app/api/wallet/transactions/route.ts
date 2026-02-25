import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    
    const transactions = await prisma.coinTransaction.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
