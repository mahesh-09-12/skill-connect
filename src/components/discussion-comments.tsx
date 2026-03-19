'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  replies: Comment[];
}

interface DiscussionCommentsProps {
  discussionId: string;
}

export default function DiscussionComments({ discussionId }: DiscussionCommentsProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [discussionId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to post comment' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${parentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to post reply' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-xl font-bold flex items-center gap-2">
        Comments ({comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)})
      </h3>

      {user ? (
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
          Please log in to participate in the discussion.
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://picsum.photos/seed/${comment.user.id}/100/100`} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                <div className="pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground hover:text-primary px-2"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="mr-1.5 h-3 w-3" /> Reply
                  </Button>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder={`Reply to ${comment.user.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px] text-sm resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleReply(comment.id)} disabled={submitting || !replyContent.trim()}>
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-12 space-y-4 border-l pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={`https://picsum.photos/seed/${reply.user.id}/100/100`} />
                      <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{reply.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}