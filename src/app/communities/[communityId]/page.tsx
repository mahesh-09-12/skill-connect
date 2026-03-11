
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/post-card';
import Link from 'next/link';
import {
  Book,
  Info,
  Trophy,
  Users,
  MessageSquare,
  Image as ImageIcon,
  LayoutDashboard,
} from 'lucide-react';
import { cookies } from 'next/headers';
import * as jose from 'jose';

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

async function getCommunity(id: string) {
    const community = await prisma.community.findUnique({
        where: { id },
        include: {
            posts: {
                include: {
                    author: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            },
        }
    });
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
  const loggedInUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;

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
                  <Button variant="ghost" asChild className="justify-start px-2 font-medium">
                    <Link href={`/communities/${community.id}`}>
                      <MessageSquare className="mr-3 h-4 w-4 text-primary" /> Feed
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start px-2">
                    <Link href={`/communities/${community.id}/posts`}>
                      <Book className="mr-3 h-4 w-4" /> Discussion Board
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start px-2">
                    <Users className="mr-3 h-4 w-4" /> Members
                  </Button>
                  <Button variant="ghost" className="justify-start px-2">
                    <Trophy className="mr-3 h-4 w-4" /> Leaderboard
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="lg:col-span-6 space-y-6">
          <Card className="border-primary/10 shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/10">
                  <AvatarImage src={`https://picsum.photos/seed/${currentUserId}/100/100`} />
                  <AvatarFallback>{loggedInUser?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="w-full space-y-3">
                  <Textarea 
                    placeholder="What's on your mind?" 
                    className="min-h-[100px] sm:min-h-[120px] resize-none border-none focus-visible:ring-0 text-base"
                  />
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground h-8">
                        <ImageIcon className="h-4 w-4 mr-2" /> Photo
                      </Button>
                    </div>
                    <Button size="sm" className="px-6">Post</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {community.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
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
                      <p className="text-xs text-muted-foreground">{user.title}</p>
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
