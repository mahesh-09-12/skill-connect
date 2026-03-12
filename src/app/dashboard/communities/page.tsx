import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) { return null; }
}

export default async function MyCommunitiesDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const communities = await prisma.community.findMany({
    where: {
      members: {
        some: {
          userId: user.userId as string,
        }
      }
    },
    include: {
      _count: {
        select: { members: true, discussions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Communities</h1>
          <p className="text-muted-foreground">Manage the tribes you're leading or participating in.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/communities">
            <Plus className="h-4 w-4" /> Explore More
          </Link>
        </Button>
      </div>

      {communities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">No communities yet</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Join or create a community to start sharing knowledge with others.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/communities">Browse Communities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {communities.map((community) => (
            <Card key={community.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-32 w-full">
                <Image 
                  src={community.thumbnailUrl} 
                  alt={community.name} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <h3 className="text-white font-bold text-lg px-4 text-center line-clamp-2">{community.name}</h3>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                   <div className="flex items-center gap-1.5">
                     <Users className="h-3.5 w-3.5" />
                     {community._count.members} Members
                   </div>
                   <div className="flex items-center gap-1.5">
                     <MessageSquare className="h-3.5 w-3.5" />
                     {community._count.discussions} Discussions
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/communities/${community.id}`}>View Feed</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/dashboard/communities/${community.id}`}>
                      Manage <Settings className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
