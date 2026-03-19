'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PlayCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Video,
  FileText,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LearningPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<any>(null);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (res.ok && data.success) {
          const found = data.courses.find((c: any) => c.id === courseId);
          if (found) {
            setCourse(found);
            // Set first lesson as default
            if (found.modules?.[0]?.lessons?.[0]) {
              setCurrentLesson(found.modules[0].lessons[0]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch course data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Preparing your classroom...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/enrolled-courses">Back to Learning Path</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2 font-bold">
          <Link href="/dashboard/enrolled-courses">
            <ArrowLeft className="h-4 w-4" /> Exit Classroom
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">You are learning:</span>
            <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full">{course.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden border-2 border-primary/10 shadow-2xl rounded-2xl">
            <div className="aspect-video bg-black relative flex items-center justify-center">
              {currentLesson?.videoUrl ? (
                <video 
                  key={currentLesson.id}
                  controls 
                  className="w-full h-full"
                  poster={course.thumbnailUrl}
                >
                  <source src={currentLesson.videoUrl.startsWith('/') ? currentLesson.videoUrl : `/${currentLesson.videoUrl}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center p-12 space-y-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Video className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-lg font-bold">No video for this lesson</p>
                    <p className="text-gray-400 text-sm">Please check the lesson notes or proceed to the next step.</p>
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-6 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tighter">
                    {currentLesson?.title || "Select a lesson"}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {currentLesson?.duration || "5:00"}
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Video className="h-4 w-4" /> Video Tutorial
                    </div>
                  </div>
                </div>
                <Button size="lg" className="font-bold gap-2 shadow-xl h-12 px-8">
                  Complete Lesson <CheckCircle2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h3 className="text-xl font-black mb-4">Lesson Overview</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {currentLesson?.description || "In this lesson, we dive deep into the core concepts of this module. Follow along with the video and take notes on the key patterns demonstrated."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Course Content */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="lg:max-h-[calc(100vh-12rem)] flex flex-col rounded-2xl shadow-xl border-primary/5">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Course Curriculum
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-8 py-6">
                {course.modules?.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10 italic">No curriculum available yet.</p>
                ) : (
                  course.modules.map((module: any, mIdx: number) => (
                    <div key={module.id} className="space-y-4">
                      <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <span className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                          {mIdx + 1}
                        </span>
                        {module.title}
                      </h4>
                      <div className="space-y-2 ml-3 border-l-2 border-muted pl-4">
                        {module.lessons?.map((lesson: any) => (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-xl text-sm transition-all group relative",
                              currentLesson?.id === lesson.id 
                                ? "bg-primary text-primary-foreground font-bold shadow-lg scale-[1.02]" 
                                : "hover:bg-muted text-foreground/80"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {currentLesson?.id === lesson.id ? (
                                <PlayCircle className="h-4 w-4 shrink-0 animate-pulse" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary shrink-0 transition-colors" />
                              )}
                              <span className="line-clamp-2">{lesson.title}</span>
                            </div>
                          </button>
                        ))}
                        {module.lessons?.length === 0 && (
                          <p className="text-xs text-muted-foreground italic pl-2">No lessons in this module.</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
