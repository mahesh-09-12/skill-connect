
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const communities = await prisma.community.findMany();
    return NextResponse.json(communities);
  } catch (error) {
    console.error('Failed to fetch communities:', error);
    return NextResponse.json({ message: 'Failed to fetch communities' }, { status: 500 });
  }
}
