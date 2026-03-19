import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ isMember: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    return NextResponse.json({ isMember: !!membership });
  } catch (error) {
    console.error('Membership check error:', error);
    return NextResponse.json({ isMember: false });
  }
}
