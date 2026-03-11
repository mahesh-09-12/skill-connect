
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, Clock, Users, Play, ShieldCheck, Globe, Coins, PlusCircle, Settings, Edit } from 'lucide-react';
import Link from 'next/link';
import EnrollmentButton from '@/components/enrollment-button';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export const dynamic = 'force-dynamic';

async function getCourse(id: string) {
    try {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                modules: {
                    include: {
                        lessons: true,
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            },
        });
        return course;
    } catch (e) {
        return null;
    }
}

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const [course, currentUserId] = await Promise.all([
    getCourse(courseId),
    getCurrentUserId()
  ]);

  if (!course) {
    notFound();
  }

  const isInstructor = currentUserId === course.instructorId;

  return (
    <div className="space-y-8 lg:space-y-12">
      <div className="relative aspect-[21/9] min-h-[300px] w-full rounded-2xl overflow-hidden bg-primary/10 shadow-xl">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-white font-bold">{course.level}</Badge>
              <Badge variant="outline" className="text-white border-white/40 backdrop-blur-sm">
                <Globe className="h-3 w-3 mr-1.5" /> {course.language}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${course.instructorId}/100/100`} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-sm sm:text-base">{course.instructor.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none gap-4 sm:gap-8 px-0">
              <TabsTrigger value="overview" className="rounded-none px-0 font-bold text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Overview</TabsTrigger>
              <TabsTrigger value="curriculum" className="rounded-none px-0 font-bold text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Curriculum</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-8 space-y-8">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold">About this course</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-bold text-sm">Full Access</p>
                      <p className="text-xs text-muted-foreground">Lifetime updates included</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-bold text-sm">Supportive Community</p>
                      <p className="text-xs text-muted-foreground">Learn with thousands of others</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {course.modules.length === 0 ? (
                  <div className="text-center py-10 border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground">No curriculum content available yet.</p>
                  </div>
                ) : (
                  course.modules.map((module, index) => (
                    <AccordionItem value={`item-${index}`} key={module.id} className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline font-bold text-lg">
                        {module.title}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-6">
                        <ul className="space-y-3">
                          {module.lessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                  <Play className="h-3 w-3 fill-current" />
                                </div>
                                <span className="font-medium text-sm sm:text-base">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{lesson.duration}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                )}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-2 border-primary shadow-xl shadow-primary/10 sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold">
                {isInstructor ? 'Course Management' : 'Join this Course'}
              </CardTitle>
              <CardDescription>
                {isInstructor 
                  ? 'You are the instructor of this course. Manage your content below.' 
                  : 'Enroll today and start learning immediately.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isInstructor && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <span className="font-bold">Course Price</span>
                  <div className="flex items-center gap-1.5">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-2xl font-black text-primary">{course.priceInCoins}</span>
                  </div>
                </div>
              )}
              
              {isInstructor ? (
                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full font-bold h-12">
                    <Link href={`/dashboard/courses/${course.id}`} className="flex items-center justify-center gap-2">
                      <Settings className="h-4 w-4" /> Manage Course Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full font-bold h-12">
                    <Link href={`/dashboard/courses/${course.id}/modules`} className="flex items-center justify-center gap-2">
                      <PlusCircle className="h-4 w-4" /> Edit Curriculum
                    </Link>
                  </Button>
                </div>
              ) : (
                <EnrollmentButton courseId={course.id} />
              )}
              
              <Separator />
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Your Instructor</h4>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={`https://picsum.photos/seed/${course.instructorId}/100/100`} />
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-extrabold text-base">{course.instructor.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Expert Domain Leader</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
