
'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Post } from '@/lib/types';
import { Heart, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLike = () => {
    // In a real app, this would be an API call
    setIsLiked(!isLiked);
  };

  return (
    <motion.div variants={postVariants}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={"https://picsum.photos/seed/user1/100/100"} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-start gap-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="sm" onClick={handleLike}>
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {isLiked ? post.likes + 1 : post.likes}
            </Button>
          </motion.div>
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            {post.comments.length}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
