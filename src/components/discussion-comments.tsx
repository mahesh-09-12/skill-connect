'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getComments, addComment, LocalComment } from '@/lib/localComments';

interface DiscussionCommentsProps {
  discussionId: string;
}

export default function DiscussionComments({ discussionId }: DiscussionCommentsProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Initial load from localStorage
  useEffect(() => {
    const stored = getComments(discussionId);
    setComments(stored);
    setLoading(false);

    // Periodic cleanup interval (every 60 seconds)
    const interval = setInterval(() => {
      const refreshed = getComments(discussionId);
      setComments(refreshed);
    }, 60000);

    return () => clearInterval(interval);
  }, [discussionId]);

  const handleSubmitComment = async () => {
    const trimmedContent = newComment.trim();
    if (!trimmedContent || !user) return;
    
    setSubmitting(true);
    try {
      const commentObj: LocalComment = {
        id: crypto.randomUUID(),
        content: trimmedContent,
        createdAt: Date.now(),
        author: {
          id: user.id,
          name: user.name,
        },
        replies: [],
      };

      const updated = addComment(discussionId, commentObj);
      setComments(updated);
      setNewComment('');
      toast({ title: "Success", description: "Comment saved locally (expires in 24h)" });
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to save comment' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    const trimmedReply = replyContent.trim();
    if (!trimmedReply || !user) return;

    setSubmitting(true);
    try {
      const replyObj: LocalComment = {
        id: crypto.randomUUID(),
        content: trimmedReply,
        createdAt: Date.now(),
        author: {
          id: user.id,
          name: user.name,
        },
        replies: [],
      };

      const updated = addComment(discussionId, replyObj, parentId);
      setComments(updated);
      setReplyContent('');
      setReplyingTo(null);
      toast({ title: "Success", description: "Reply saved locally" });
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to save reply' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const totalComments = comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);

  return (
    <div className="space-y-8 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Comments ({totalComments})
        </h3>
        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Local Storage / 24h Expiry
        </span>
      </div>

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
              disabled={submitting}
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
                <AvatarImage src={`https://picsum.photos/seed/${comment.author.id}/100/100`} />
                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{comment.author.name}</span>
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
                        placeholder={`Reply to ${comment.author.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px] text-sm resize-none"
                        disabled={submitting}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} disabled={submitting}>Cancel</Button>
                        <Button size="sm" onClick={() => handleReply(comment.id)} disabled={submitting || !replyContent.trim()}>
                          {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 space-y-4 border-l pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={`https://picsum.photos/seed/${reply.author.id}/100/100`} />
                      <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{reply.author.name}</span>
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
        {comments.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
