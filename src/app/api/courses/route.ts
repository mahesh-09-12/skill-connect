import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
          }
        },
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courses || []);
  } catch (error: any) {
    console.error('Error in /api/courses:', error);
    
    // Check if the error is due to missing tables
    if (error.code === 'P2021') {
      return NextResponse.json({ 
        message: 'Database tables are missing. Please run "npx prisma db push".',
        detail: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Failed to fetch courses from database',
      detail: error.message 
    }, { status: 500 });
  }
}
