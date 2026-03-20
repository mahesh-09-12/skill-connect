'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_COURSE_IMAGE } from '@/lib/constants/images';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const thumbnailUrl = course.thumbnailUrl || DEFAULT_COURSE_IMAGE;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden border-primary/10 shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-110"
            data-ai-hint="course thumbnail"
          />
          <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white border-none shadow-none font-bold">
            {course.level}
          </Badge>
        </div>
        <CardHeader className="p-4 space-y-2 flex-grow">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold h-5">
              {course.language}
            </Badge>
          </div>
          <CardTitle className="text-lg font-bold line-clamp-2 leading-tight min-h-[3rem]">
            {course.title}
          </CardTitle>
          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-6 w-6 border">
              <AvatarImage src={`https://picsum.photos/seed/${course.instructorId}/100/100`} />
              <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground truncate">{course.instructor.name}</span>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full font-bold group">
            <Link href={`/courses/${course.id}`}>
              View Course <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}