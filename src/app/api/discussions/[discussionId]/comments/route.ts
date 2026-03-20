import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const { discussionId } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { 
        discussionId,
        parentId: null 
      },
      include: {
        author: {
          select: { id: true, name: true }
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error("Discussion comments fetch error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

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
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: 'Invalid authentication' }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Comment content is required' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        discussionId,
        authorId: decoded.userId,
      },
      include: {
        author: { select: { id: true, name: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true } }
          }
        }
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error("Comment API error:", error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
