import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PATCH(
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
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json({ message: 'Discussion not found' }, { status: 404 });
    }

    if (discussion.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const updatedDiscussion = await prisma.discussion.update({
      where: { id: discussionId },
      data: { content: content.trim() },
    });

    return NextResponse.json(updatedDiscussion);
  } catch (error: any) {
    console.error('Discussion update error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json({ message: 'Discussion not found' }, { status: 404 });
    }

    if (discussion.authorId !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await prisma.discussion.delete({
      where: { id: discussionId },
    });

    return NextResponse.json({ message: 'Discussion deleted successfully' });
  } catch (error: any) {
    console.error('Discussion deletion error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
