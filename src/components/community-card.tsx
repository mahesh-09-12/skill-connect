'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, MessageSquare } from 'lucide-react';
import { Community } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_COMMUNITY_IMAGE } from '@/lib/constants/images';

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const thumbnailUrl = community.thumbnailUrl || DEFAULT_COMMUNITY_IMAGE;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden border-primary/10 shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={community.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-110"
            data-ai-hint="community photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge className="absolute bottom-2 left-2 bg-primary text-white border-none font-bold">
            {community.category}
          </Badge>
        </div>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xl font-extrabold line-clamp-1">{community.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {community.description}
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>{community.memberCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>{community._count?.discussions ?? 0} posts</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full font-bold group" variant="secondary">
            <Link href={`/communities/${community.id}`}>
              Enter Community <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}