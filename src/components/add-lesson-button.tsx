'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Video, FileText } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface AddLessonButtonProps {
  moduleId: string;
}

export default function AddLessonButton({ moduleId }: AddLessonButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      const videoInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
      const videoFile = videoInput.files?.[0];
      
      let videoUrl = "";
      let duration = "0:00";

      // 1. Upload to Cloudinary if file exists
      if (videoFile) {
        // Calculate duration locally before upload
        duration = await new Promise<string>((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            const durationSeconds = Math.floor(video.duration);
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = durationSeconds % 60;
            resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          };
          video.onerror = () => resolve("0:00");
          video.src = URL.createObjectURL(videoFile);
        });

        const uploadFormData = new FormData();
        uploadFormData.append('file', videoFile);

        const uploadRes = await fetch("/api/upload/video", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Failed to upload video to cloud");
        }

        const uploadData = await uploadRes.json();
        videoUrl = uploadData.url;
      }

      // 2. Save Lesson to DB
      const lessonRes = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          title: title.trim(),
          description: description.trim(),
          duration,
          videoUrl
        }),
      });

      if (!lessonRes.ok) {
        const err = await lessonRes.json();
        throw new Error(err.error || "Failed to create lesson record");
      }

      toast({ title: "Success", description: "Lesson created and video uploaded successfully" });
      setOpen(false);
      setTitle('');
      setDescription('');
      window.location.reload();
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Could not complete lesson creation" 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => setOpen(true)}>
        <PlusCircle className="h-3 w-3" /> Add Lesson
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Create a new educational lesson. Videos will be stored securely in the cloud.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title" className="flex items-center gap-2 text-sm font-bold">
                  <FileText className="h-4 w-4 text-primary" /> Lesson Title
                </Label>
                <Input
                  id="lesson-title"
                  placeholder="e.g. Introduction to React Components"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-description" className="text-sm font-bold">Description</Label>
                <Textarea
                  id="lesson-description"
                  placeholder="Provide a brief overview of what this lesson covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-video" className="flex items-center gap-2 text-sm font-bold">
                  <Video className="h-4 w-4 text-primary" /> Tutorial Video
                </Label>
                <Input
                  id="lesson-video"
                  type="file"
                  accept="video/*"
                  className="cursor-pointer file:text-primary file:font-semibold h-11 py-2"
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground italic px-1">
                  Videos are uploaded to Cloudinary. Large files may take a few moments.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !title.trim()} className="min-w-[120px] font-bold">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  'Create Lesson'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
