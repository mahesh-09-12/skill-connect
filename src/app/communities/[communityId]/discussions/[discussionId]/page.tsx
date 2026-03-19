import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostCard from '@/components/post-card';
import DiscussionComments from '@/components/discussion-comments';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ communityId: string, discussionId: string }>;
}) {
  const { communityId, discussionId } = await params;

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: {
      author: true,
      _count: {
        select: { likes: true, comments: true }
      }
    }
  });

  if (!discussion || discussion.communityId !== communityId) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center">
        <Button variant="ghost" asChild className="gap-2">
          <Link href={`/communities/${communityId}/posts`}>
            <ArrowLeft className="h-4 w-4" /> Back to Discussions
          </Link>
        </Button>
      </div>

      <PostCard post={discussion as any} isDetail />
      
      <DiscussionComments discussionId={discussionId} />
    </div>
  );
}