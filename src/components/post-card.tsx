'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageSquare, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    authorId: string;
    communityId: string;
    createdAt: string;
    author: {
      name: string;
    };
    _count?: {
      comments: number;
      likes: number;
    };
  };
  isDetail?: boolean;
}

export default function PostCard({ post, isDetail = false }: PostCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function checkLikeStatus() {
      if (!user) return;
      try {
        const res = await fetch(`/api/discussions/${post.id}/like-status`);
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked);
        }
      } catch (err) {}
    }
    checkLikeStatus();
  }, [post.id, user]);

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount(prev => prevLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/discussions/${post.id}/like`, {
        method: 'POST',
      });

      if (!res.ok) {
        // Rollback
        setIsLiked(prevLiked);
        setLikeCount(prev => prevLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      // Rollback
      setIsLiked(prevLiked);
      setLikeCount(prev => prevLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDetail) return;
    router.push(`/communities/${post.communityId}/discussions/${post.id}`);
  };

  const handleCardClick = () => {
    if (isDetail) return;
    router.push(`/communities/${post.communityId}/discussions/${post.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/discussions/${post.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Discussion deleted' });
        setShowDeleteDialog(false);
        if (isDetail) {
          router.push(`/communities/${post.communityId}`);
        } else {
          router.refresh();
        }
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/discussions/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Discussion updated' });
        setIsEditing(false);
        router.refresh();
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const isAuthor = user?.id === post.authorId;

  const cleanLine = (line: string) => {
    return line.replace(/^#+\s*/, "");
  };

  const lines = post.content.split('\n');
  const firstLine = lines[0];
  const otherLines = lines.slice(1).join('\n');

  return (
    <motion.div variants={postVariants} initial="hidden" animate="visible">
      <Card 
        className={`${isDeleting ? 'opacity-50 pointer-events-none' : ''} ${!isDetail ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={`https://picsum.photos/seed/${post.authorId}/100/100`} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor ? (
                <>
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditContent(post.content);
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="cursor-pointer">
                  Report Discussion
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-semibold text-base text-foreground leading-tight">
            {cleanLine(firstLine)}
          </p>
          {otherLines.length > 0 && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {otherLines}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-start gap-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike} 
              disabled={isLiking}
              className={isLiked ? 'text-primary' : ''}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
          </motion.div>
          <Button variant="ghost" size="sm" onClick={handleCommentClick}>
            <MessageSquare className="mr-2 h-4 w-4" />
            {post._count?.comments || 0}
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Discussion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discussion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Discussion</DialogTitle>
            <DialogDescription>Make changes to your post below.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[150px] resize-none"
              disabled={isUpdating}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={isUpdating || !editContent.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}