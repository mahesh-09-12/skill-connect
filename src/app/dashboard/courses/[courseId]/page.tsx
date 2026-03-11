
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
  ExternalLink,
  ChevronRight,
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

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseEditorPage({ params }: PageProps) {
  const { courseId } = await params;

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
    notFound();
  }

  if (course.instructorId !== user.userId) {
    redirect('/dashboard/courses');
  }

  return (
    <div className="space-y-8">
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
          <h1 className="text-3xl font-extrabold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground max-w-2xl">Course Management Hub</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
             <Link href={`/dashboard/courses/${course.id}/edit`}>Edit Details</Link>
          </Button>
          <Button asChild>
             <Link href={`/dashboard/courses/${course.id}/modules`}>Manage Curriculum</Link>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              Modules
            </CardTitle>
            <CardDescription>Manage course sections</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{course.modules.length}</p>
            <Button asChild variant="link" className="px-0 mt-4 text-primary">
              <Link href={`/dashboard/courses/${course.id}/modules`} className="flex items-center">
                Configure Modules <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Lessons
            </CardTitle>
            <CardDescription>Video content & tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
            </p>
            <Button asChild variant="link" className="px-0 mt-4 text-primary">
              <Link href={`/dashboard/courses/${course.id}/lessons`} className="flex items-center">
                Manage Content <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              Earnings
            </CardTitle>
            <CardDescription>Course revenue in coins</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground mt-2">New course stats coming soon</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Curriculum</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
             {course.modules.slice(0, 3).map((module) => (
               <div key={module.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                 <div className="flex items-center gap-3">
                   <Layers className="h-4 w-4 text-muted-foreground" />
                   <span className="font-medium">{module.title}</span>
                 </div>
                 <Badge variant="outline">{module.lessons.length} Lessons</Badge>
               </div>
             ))}
             {course.modules.length === 0 && (
               <p className="text-sm text-muted-foreground italic">No modules added yet.</p>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
