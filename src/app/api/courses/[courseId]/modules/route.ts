import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });

    return NextResponse.json(modules);
  } catch (error: any) {
    console.error('Fetch modules error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
