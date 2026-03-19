import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/post-card';
import Link from 'next/link';
import {
  Book,
  Users,
  MessageSquare,
} from 'lucide-react';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { Prisma } from '@prisma/client';

// Define the precise type for Community including discussions and nested relations
type CommunityWithDiscussions = Prisma.CommunityGetPayload<{
  include: {
    discussions: {
      include: {
        author: true,
        _count: {
          select: { comments: true, likes: true }
        }
      }
    }
  }
}>;

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

async function getCommunity(id: string): Promise<CommunityWithDiscussions | null> {
    if (!id) return null;
    const community = await prisma.community.findUnique({
        where: { id },
        include: {
            discussions: {
                include: {
                    author: true,
                    _count: {
                      select: { comments: true, likes: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
        },
    } as any) as CommunityWithDiscussions | null;
    return community;
}

async function getTopContributors(communityId: string) {
    const users = await prisma.user.findMany({ take: 3 });
    return users.map(user => ({...user, title: "Contributor"}));
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const [community, currentUserId] = await Promise.all([
    getCommunity(communityId),
    getCurrentUserId()
  ]);

  if (!community) {
    notFound();
  }

  const topContributors = await getTopContributors(communityId);

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Banner */}
      <div className="relative h-40 sm:h-64 lg:h-80 w-full overflow-hidden rounded-xl bg-primary/10">
        <Image
          src={community.thumbnailUrl}
          alt={community.name}
          fill
          className="object-cover"
          priority
          data-ai-hint="community banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                {community.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/80 line-clamp-2">
                {community.description}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" variant="secondary" className="font-bold border bg-muted text-foreground hover:bg-muted/80 shadow-lg">
                 <Link href={`/communities/${community.id}/posts`}>View Discussions</Link>
              </Button>
              <Button size="lg" className="font-bold shadow-lg">
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="hidden lg:block lg:col-span-3 space-y-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex flex-col space-y-1">
                  <Button variant="ghost" asChild className="justify-start px-2 font-medium text-primary">
                    <Link href={`/communities/${community.id}`}>
                      <MessageSquare className="mr-3 h-4 w-4" /> Feed
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start px-2">
                    <Link href={`/communities/${community.id}/posts`}>
                      <Book className="mr-3 h-4 w-4" /> Discussion Board
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start px-2">
                    <Link href={`/communities/${community.id}/members`}>
                      <Users className="mr-3 h-4 w-4" /> Members
                    </Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="lg:col-span-6 space-y-6">
          <div className="space-y-6">
            {community.discussions.map((discussion) => (
              <PostCard key={discussion.id} post={discussion as any} />
            ))}
            {community.discussions.length === 0 && (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="p-12 text-center text-muted-foreground">
                  No activity yet. Start the conversation!
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Members</span>
                  <span className="font-bold">{community.memberCount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Now</span>
                  <span className="font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {Math.floor(community.memberCount / 15).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="font-bold text-primary">{community.category}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Contributor</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5">Top</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}