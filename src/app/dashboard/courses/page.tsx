'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { BookOpen, Plus, Calendar, Layers, ChevronRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstructorCourse {
  id: string;
  title: string;
  createdAt: string;
  _count: {
    modules: number;
  };
}

export default function MyCoursesPage() {
  const { user, isLoading: userLoading } = useUser();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      async function fetchMyCourses() {
        try {
          const res = await fetch('/api/courses/my-courses');
          if (res.ok) {
            const data = await res.json();
            setCourses(data);
          } else {
            setError("Failed to load your courses");
          }
        } catch (err) {
          setError("Failed to load your courses");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      fetchMyCourses();
    }
  }, [user, userLoading, router]);

  const handleCreateCourse = () => {
    try {
      router.push("/courses/create");
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">{error}</h1>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Your Courses</h1>
          <p className="text-muted-foreground mt-1">Create and manage your educational content.</p>
        </div>
        <Button onClick={handleCreateCourse} className="gap-2">
          <Plus className="h-4 w-4" /> Create New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">No courses created</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You haven't created any courses yet. Share your expertise and earn rewards for every course you publish.
              </p>
            </div>
            <Button onClick={handleCreateCourse} size="lg">Get Started Now</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                   <Calendar className="h-3.5 w-3.5" />
                   Created {format(new Date(course.createdAt), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>{course._count.modules} Modules</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full group" onClick={() => router.push(`/courses/${course.id}`)}>
                  View Page <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
