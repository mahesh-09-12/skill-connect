import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: parentId } = await params;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId }
    });

    if (!parentComment) {
      return NextResponse.json({ message: 'Parent comment not found' }, { status: 404 });
    }

    const reply = await prisma.comment.create({
      data: {
        content: content.trim(),
        discussionId: parentComment.discussionId,
        userId: decoded.userId,
        parentId: parentId
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error: any) {
    console.error("Reply creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}