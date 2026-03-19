'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, ArrowRight, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface EnrollmentWithCourse {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    instructor: {
      name: string;
    };
  };
}

export default function EnrolledCoursesPage() {
  const { user, isLoading: userLoading } = useUser();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      async function fetchEnrollments() {
        try {
          const res = await fetch('/api/users/me/enrollments');
          if (res.ok) {
            const data = await res.json();
            setEnrollments(data);
          }
        } catch (err) {
          console.error("Failed to load enrollments", err);
        } finally {
          setLoading(false);
        }
      }
      fetchEnrollments();
    }
  }, [user, userLoading, router]);

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Learning Path</h1>
        <p className="text-muted-foreground mt-1">Pick up right where you left off in your courses.</p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">No courses yet</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You haven&apos;t enrolled in any courses yet. Start exploring our catalog to find your next skill.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/courses">Browse Catalog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden group hover:shadow-md transition-shadow flex flex-col rounded-2xl border-primary/5">
              <div className="relative aspect-video w-full overflow-hidden">
                <Image 
                  src={enrollment.course.thumbnailUrl} 
                  alt={enrollment.course.title} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                   <div className="flex justify-between items-end">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-primary/80 px-2 py-0.5 rounded">
                        Active
                      </span>
                   </div>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {enrollment.course.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{enrollment.course.instructor.name}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary">{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-1.5" />
                </div>

                <Button asChild className="w-full font-bold group mt-auto rounded-xl">
                  <Link href={`/courses/${enrollment.course.id}/learn`}>
                    Continue Learning <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
