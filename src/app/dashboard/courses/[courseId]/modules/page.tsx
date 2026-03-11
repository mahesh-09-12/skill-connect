
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Layers, GripVertical, Edit, Trash2 } from 'lucide-react';
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

export default async function ModuleManagementPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: { createdAt: 'asc' } },
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
          <PlusCircle className="h-4 w-4" /> Add New Module
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">Structure your course curriculum by adding and organizing modules.</p>
        </div>

        <div className="grid gap-4">
          {course.modules.length === 0 ? (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="p-12 text-center">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold">No modules yet</h3>
                <p className="text-muted-foreground mb-6">Create your first module to start building the curriculum.</p>
                <Button>Create First Module</Button>
              </CardContent>
            </Card>
          ) : (
            course.modules.map((module, index) => (
              <Card key={module.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{module.title}</span>
                      <span className="text-xs text-muted-foreground">Last updated {new Date(module.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
