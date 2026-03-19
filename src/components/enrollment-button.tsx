
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Loader2, PlayCircle } from 'lucide-react';

export default function EnrollmentButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  // Check enrollment status on mount
  useEffect(() => {
    async function checkStatus() {
      if (!user) {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch(`/api/courses/${courseId}/enrollment-status`);
        if (res.ok) {
          const data = await res.json();
          setIsEnrolled(data.enrolled);
        }
      } catch (error) {
        console.error("Failed to check enrollment status", error);
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Successfully Enrolled!',
          description: 'Coins have been deducted from your wallet.',
        });
        setIsEnrolled(true);
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Enrollment Failed',
          description: data.message || 'Something went wrong.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to complete enrollment.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button size="lg" className="w-full font-bold h-12 text-base" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking Status...
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button 
        size="lg" 
        className="w-full font-bold h-12 text-base bg-green-600 hover:bg-green-700 text-white" 
        onClick={() => router.push('/dashboard')}
      >
        <PlayCircle className="mr-2 h-5 w-5" /> Continue Learning
      </Button>
    );
  }

  return (
    <Button 
      size="lg" 
      className="w-full font-bold h-12 text-base" 
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
      ) : (
        'Enroll Now'
      )}
    </Button>
  );
}
