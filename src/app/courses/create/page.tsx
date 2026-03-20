'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_COURSE_IMAGE } from '@/lib/constants/images';

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  thumbnailUrl: z.string().url('Please enter a valid image URL'),
  priceInCoins: z.coerce.number().min(0, 'Price must be 0 or more'),
  level: z.string().min(1, 'Please select a difficulty level'),
  language: z.string().min(1, 'Please select a language'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnailUrl: DEFAULT_COURSE_IMAGE,
      priceInCoins: 50,
      level: 'Beginner',
      language: 'English',
    },
  });

  async function onSubmit(values: CourseFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Course created successfully',
          description: `You earned 50 bonus coins! New balance: ${data.newBalance}`,
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: data.message || 'Failed to create course. Please check your inputs.',
        });
      }
    } catch (error: any) {
      console.error("Course creation submission error:", error);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Could not connect to the server. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link 
        href="/dashboard" 
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Create New Course</CardTitle>
            <div className="flex items-center gap-2 bg-green-500/10 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
              <Coins className="h-3 w-3" />
              Earn 50 Coins
            </div>
          </div>
          <CardDescription>
            Share your expertise with the community. You'll earn coins for publishing and learners will spend coins to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Advanced React Patterns" {...field} />
                    </FormControl>
                    <FormDescription>A catchy title that describes your expertise.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What will students learn in this course?" 
                        className="min-h-[120px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priceInCoins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Price (Coins)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" {...field} className="pl-9" />
                          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                        </div>
                      </FormControl>
                      <FormDescription>How many coins should learners pay?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>URL for your course cover image.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full font-bold h-12 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Course...
                    </>
                  ) : (
                    'Create Course & Collect Reward'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}