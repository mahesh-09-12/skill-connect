import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { courseId, title } = await req.json();

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
    }

    const count = await prisma.module.count({
      where: { courseId }
    });

    const nextOrder = count + 1;

    const module = await prisma.module.create({
      data: {
        title: title || 'New Module',
        order: nextOrder,
        courseId
      }
    });

    return NextResponse.json(module);
  } catch (error: any) {
    console.error('Module creation error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
