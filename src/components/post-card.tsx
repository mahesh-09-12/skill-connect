'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
    likes?: any[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  // Basic like tracking
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const res = await fetch(`/api/discussions/${post.id}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentClick = () => {
    router.push(`/communities/${post.communityId}/posts`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/discussions/${post.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Discussion deleted' });
        router.refresh();
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

  const isAuthor = user?.id === post.authorId;

  return (
    <motion.div variants={postVariants} initial="hidden" animate="visible">
      <Card className={isDeleting ? 'opacity-50 pointer-events-none' : ''}>
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
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor ? (
                <>
                  <DropdownMenuItem className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleDelete}>
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
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
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
    </motion.div>
  );
}