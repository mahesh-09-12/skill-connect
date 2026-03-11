
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Play, Clock, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) { return null; }
}

export default async function LessonManagementPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { createdAt: 'asc' }
      },
    },
  });

  if (!course || course.instructorId !== user.userId) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/courses/${course.id}`} 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Link>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" /> Add New Lesson
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Lesson Content</h1>
          <p className="text-muted-foreground">Manage the educational content and video tutorials for each module.</p>
        </div>

        {course.modules.length === 0 ? (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="p-12 text-center">
              <Play className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold">No curriculum structure</h3>
              <p className="text-muted-foreground mb-6">You need to create at least one module before adding lessons.</p>
              <Button asChild variant="outline">
                <Link href={`/dashboard/courses/${course.id}/modules`}>Go to Modules</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          course.modules.map((module) => (
            <div key={module.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-sm">Module</Badge>
                  {module.title}
                </h3>
                <Button size="sm" variant="outline" className="h-8 gap-2">
                  <PlusCircle className="h-3 w-3" /> Add Lesson
                </Button>
              </div>
              <div className="grid gap-2">
                {module.lessons.map((lesson) => (
                  <Card key={lesson.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 text-primary">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lesson.duration}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {module.lessons.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed rounded-lg bg-muted/5">
                    <p className="text-sm text-muted-foreground">No lessons in this module yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
