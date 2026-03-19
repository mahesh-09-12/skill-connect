
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Play, CheckCircle, ArrowLeft, BookOpen, Video } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LearnContentProps {
  course: any;
}

export default function LearnContent({ course }: LearnContentProps) {
  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const [currentLesson, setCurrentLesson] = useState(allLessons[0] || null);

  if (!course.modules || course.modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No content available yet</h1>
        <p className="text-muted-foreground max-w-sm">
          The instructor hasn't added any modules or lessons to this course.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Sidebar - Course Structure */}
      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/enrolled-courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="font-bold text-lg truncate">{course.title}</h2>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] border rounded-xl bg-card">
          <div className="p-4">
            <Accordion type="multiple" defaultValue={[course.modules[0]?.id]} className="space-y-2">
              {course.modules.map((module: any) => (
                <AccordionItem key={module.id} value={module.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-lg hover:bg-muted/50 text-sm font-bold text-left">
                    {module.title}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2">
                    <div className="flex flex-col gap-1 pl-2">
                      {module.lessons.map((lesson: any) => (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={cn(
                            "flex items-center gap-3 w-full p-2.5 rounded-md text-xs transition-colors text-left",
                            currentLesson?.id === lesson.id
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-muted text-muted-foreground"
                          )}
                        >
                          <Play className={cn("h-3 w-3 shrink-0", currentLesson?.id === lesson.id ? "fill-current" : "")} />
                          <span className="line-clamp-2">{lesson.title}</span>
                          {lesson.completed && (
                            <CheckCircle className="h-3 w-3 ml-auto text-green-500 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content Area - Video Player */}
      <main className="flex-1 space-y-6 min-w-0">
        {currentLesson ? (
          <div className="space-y-6">
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative">
              {currentLesson.videoUrl ? (
                <video 
                  key={currentLesson.id}
                  controls 
                  className="w-full h-full object-contain"
                  poster={course.thumbnailUrl}
                >
                  <source src={currentLesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                  <Video className="h-16 w-16 opacity-20" />
                  <p>No video content for this lesson.</p>
                </div>
              )}
            </div>

            <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Currently Viewing</p>
                  <h1 className="text-2xl font-black">{currentLesson.title}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="font-bold">
                    Mark as Complete
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {currentLesson.description || "No additional description for this lesson."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-muted/20 border-2 border-dashed rounded-2xl">
            <Play className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Select a lesson from the sidebar to begin learning.</p>
          </div>
        )}
      </main>
    </div>
  );
}
