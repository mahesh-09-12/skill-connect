
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/post-card';

export const dynamic = 'force-dynamic';

export default async function CommunityDiscussionPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      posts: {
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!community) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href={`/communities/${community.id}`} 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Community Feed
        </Link>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" /> New Discussion
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
             <MessageSquare className="h-8 w-8 text-primary" />
             {community.name} Discussions
          </h1>
          <p className="text-muted-foreground">Ask questions, share insights, and engage with other community members.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search discussions..." className="pl-10 h-12" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge>All</Badge>
          <Badge variant="outline">Unanswered</Badge>
          <Badge variant="outline">Announcements</Badge>
          <Badge variant="outline">Q&A</Badge>
        </div>

        <div className="grid gap-6">
          {community.posts.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <p className="text-muted-foreground">No discussions started yet. Be the first to post!</p>
            </div>
          ) : (
            community.posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
