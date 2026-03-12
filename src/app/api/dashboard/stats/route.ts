import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        coinBalance: true,
        streak: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Parallel fetching for performance
    const [
      courseCount,
      communityCount,
      rank,
      enrolledCourses,
      recentTransactions,
      recentPosts
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.communityMember.count({ where: { userId } }),
      prisma.user.count({ where: { coinBalance: { gt: user.coinBalance } } }).then(c => c + 1),
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: true },
        take: 3
      }),
      prisma.coinTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.communityMember.findMany({
        where: { userId },
        include: {
          community: {
            include: {
              discussions: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        },
        take: 3
      })
    ]);

    // Build activity feed
    const activities = [
      ...recentTransactions.map(t => ({
        text: t.reason,
        date: t.createdAt,
        type: 'transaction'
      })),
      ...recentPosts.flatMap(cm => cm.community.discussions.map(p => ({
        text: `New discussion in ${cm.community.name}`,
        date: p.createdAt,
        type: 'post'
      })))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    return NextResponse.json({
      stats: {
        courseCount,
        communityCount,
        streak: user.streak,
        rank: `#${rank}`
      },
      enrolledCourses: enrolledCourses.map(e => ({
        title: e.course.title,
        progress: e.progress,
        id: e.courseId
      })),
      activities
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
