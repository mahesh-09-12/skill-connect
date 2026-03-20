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

    // Update lastSeenAt for "Active Now" tracking
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() }
    }).catch(() => {
      // Silence if field doesn't exist yet
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        coinBalance: true,
        streak: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Parallel fetching for performance
    const [
      enrolledCoursesCount,
      joinedCommunitiesCount,
      rank,
      enrolledCourses,
      recentTransactions,
      recentCommunities
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
                orderBy: { id: 'desc' },
                take: 1
              }
            }
          }
        },
        take: 2
      })
    ]);

    // Build activity feed from transactions and community posts
    const activities = [
      ...recentTransactions.map(t => ({
        text: t.reason,
        date: t.createdAt?.toISOString() || new Date().toISOString(),
        type: 'transaction'
      })),
      ...recentCommunities.flatMap(cm => cm.community.discussions.map(p => ({
        text: `New post in ${cm.community.name}`,
        date: p.id, // Using ID or createdAt if available
        type: 'post'
      })))
    ].slice(0, 5);

    return NextResponse.json({
      enrolledCourses: enrolledCoursesCount,
      communities: joinedCommunitiesCount,
      stats: {
        streak: user.streak,
        rank: `#${rank}`
      },
      enrolledCoursesList: enrolledCourses.map(e => ({
        id: e.course.id,
        title: e.course.title,
        progress: e.progress,
        nextLesson: "Continue where you left off"
      })),
      activities
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
