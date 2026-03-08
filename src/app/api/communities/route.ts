import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      orderBy: {
        memberCount: 'desc'
      }
    });
    
    return NextResponse.json(communities || []);
  } catch (error: any) {
    console.error('Error in /api/communities:', error);

    // Check if the error is due to missing tables
    if (error.code === 'P2021') {
      return NextResponse.json({ 
        message: 'Database tables are missing. Please run "npx prisma db push".',
        detail: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Failed to fetch communities from database',
      detail: error.message 
    }, { status: 500 });
  }
}
