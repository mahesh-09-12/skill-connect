import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  PlusCircle, 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Play, 
  Clock, 
  Edit, 
  ExternalLink 
} from 'lucide-react';
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
  } catch (error) {
    return null;
  }
}

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  if (!courseId) {
    throw new Error("Missing course id");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/courses">Back to My Courses</Link>
        </Button>
      </div>
    );
  }

  if (course.instructorId !== user.userId) {
    redirect('/dashboard/courses');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/courses" 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Courses
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href={`/courses/${course.id}`} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> View Public Page
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.language}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground max-w-2xl line-clamp-2">
            {course.description}
          </p>
        </div>
        <Button asChild className="font-bold">
          <Link href={`/courses/${course.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" /> Edit Course Details
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              Course Curriculum
            </h2>
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add Module
            </Button>
          </div>

          {course.modules.length === 0 ? (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="p-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold">No modules created yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start building your course by adding your first module.
                  </p>
                </div>
                <Button variant="outline" size="sm">Add First Module</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {course.modules.map((module, index) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Module {index + 1}: {module.title}</CardTitle>
                        <CardDescription>{module.lessons.length} Lessons</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Play className="h-3 w-3 fill-current" />
                            </div>
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {lesson.duration}
                            </span>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-muted/10">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-primary hover:text-primary hover:bg-primary/5 gap-2 border-dashed border">
                          <PlusCircle className="h-4 w-4" /> Add Lesson to Module
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-500">Live</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold">{course.priceInCoins} Coins</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Modules</span>
                  <span className="font-bold">{course.modules.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Lessons</span>
                  <span className="font-bold">
                    {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Creator Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Courses with more than 5 modules see 40% higher engagement. Try breaking your content into smaller, focused chunks!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
