import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Minimal safe query to prevent timeouts and massive payloads
    // We use _count for the list view and only include essential discussion info
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            discussions: true,
            members: true,
          }
        },
        discussions: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              }
            },
            _count: {
              select: { comments: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Only fetch a few recent discussions per community for the list view
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(communities || []);
  } catch (error: any) {
    console.error('Communities fetch error:', error);

    // Specific handling for missing tables
    if (error.code === 'P2021') {
      return NextResponse.json({ 
        message: 'Database tables are missing. Please run "npx prisma db push".',
        error: 'TABLE_NOT_FOUND'
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Internal server error while fetching communities',
      error: error.message 
    }, { status: 500 });
  }
}
