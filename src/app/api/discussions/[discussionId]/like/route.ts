import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const { discussionId } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    const existingLike = await prisma.discussionLike.findUnique({
      where: {
        userId_discussionId: {
          userId,
          discussionId,
        },
      },
      select: { id: true }
    });

    if (existingLike) {
      await prisma.discussionLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.discussionLike.create({
        data: {
          userId,
          discussionId,
        },
        select: { id: true }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    console.error('Discussion like error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}