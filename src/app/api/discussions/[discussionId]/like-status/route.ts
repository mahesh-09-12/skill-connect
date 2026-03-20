import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const { discussionId } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ liked: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    
    const like = await prisma.discussionLike.findUnique({
      where: {
        userId_discussionId: {
          userId: decoded.userId,
          discussionId,
        },
      },
      select: { id: true }
    });

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    return NextResponse.json({ liked: false });
  }
}