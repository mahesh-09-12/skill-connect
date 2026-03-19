import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  const { communityId } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ message: 'Community not found' }, { status: 404 });
    }

    const existingMembership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ joined: true, message: 'Already a member' });
    }

    await prisma.$transaction([
      prisma.communityMember.create({
        data: { userId, communityId },
      }),
      prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ joined: true });
  } catch (error: any) {
    console.error('Community join error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
