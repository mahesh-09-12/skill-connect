'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Video, 
  Pencil, 
  Trash, 
  Loader2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import AddLessonButton from "@/components/add-lesson-button";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function LessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchCourseData = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (res.ok && data.success) {
        const found = data.courses.find((c: any) => c.id === courseId);
        if (found) {
          setCourse(found);
        }
      }
    } catch (error) {
      console.error("Failed to fetch course", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  async function deleteLesson(id: string) {
    const res = await fetch(`/api/lessons/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      toast({ title: "Lesson Deleted", description: "The lesson has been removed." });
      fetchCourseData();
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: "Could not delete lesson." });
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/lessons/${editingLesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim()
        })
      });

      if (res.ok) {
        toast({ title: "Lesson Updated", description: "Changes saved successfully." });
        setEditingLesson(null);
        fetchCourseData();
        router.refresh();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not update lesson." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Course not found</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/courses">Back to My Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/courses/${course.id}`} 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Link>
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
          course.modules.map((module: any) => (
            <div key={module.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-sm">Module</Badge>
                    {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  )}
                </div>
                <AddLessonButton moduleId={module.id} />
              </div>
              <div className="grid gap-3">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson: any) => (
                    <Card 
                      key={lesson.id} 
                      className="group hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Play className="h-5 w-5 fill-current" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-base">{lesson.title}</span>
                            {lesson.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-lg mb-1">{lesson.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground/80">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {lesson.duration || "5:00"}
                              </span>
                              {lesson.videoUrl && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Video className="h-3 w-3" /> Video Attached
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLesson(lesson);
                              setEditTitle(lesson.title);
                              setEditDescription(lesson.description || "");
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLessonToDelete(lesson);
                            }}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-8 text-center border-2 border-dashed rounded-lg bg-muted/5">
                    <p className="text-sm text-muted-foreground font-medium">No lessons in this module yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={selectedLesson !== null} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedLesson?.title}</DialogTitle>
          </DialogHeader>
          <video
            src={selectedLesson?.videoUrl}
            controls
            className="w-full rounded-lg"
            autoPlay
          />
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Confirmation Dialog */}
      <Dialog open={lessonToDelete !== null} onOpenChange={() => setLessonToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setLessonToDelete(null)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteLesson(lessonToDelete.id);
                setLessonToDelete(null);
              }}
              className="font-bold"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={editingLesson !== null} onOpenChange={() => setEditingLesson(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update the lesson details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-title" className="flex items-center gap-2 text-sm font-bold">
                  <FileText className="h-4 w-4 text-primary" /> Lesson Title
                </Label>
                <Input
                  id="edit-lesson-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  disabled={isUpdating}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-lesson-description" className="text-sm font-bold">Description</Label>
                <Textarea
                  id="edit-lesson-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditingLesson(null)} disabled={isUpdating} className="font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating || !editTitle.trim()} className="min-w-[120px] font-bold">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}