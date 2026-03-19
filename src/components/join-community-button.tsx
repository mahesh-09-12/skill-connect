'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react';

interface JoinCommunityButtonProps {
  communityId: string;
  initialIsMember?: boolean;
}

export default function JoinCommunityButton({ communityId, initialIsMember = false }: JoinCommunityButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(!initialIsMember);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (initialIsMember) {
      setChecking(false);
      return;
    }

    async function checkStatus() {
      try {
        const res = await fetch(`/api/communities/${communityId}/membership`);
        if (res.ok) {
          const data = await res.json();
          setIsMember(data.isMember);
        }
      } catch (error) {
        console.error("Failed to check membership status", error);
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, [communityId, initialIsMember]);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        setIsMember(true);
        toast({
          title: "Welcome to the tribe!",
          description: "You are now a member of this community.",
        });
        router.refresh();
      } else {
        const data = await res.json();
        if (res.status === 401) {
          router.push('/login');
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Failed to join community",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button size="lg" disabled className="font-bold shadow-lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
      </Button>
    );
  }

  if (isMember) {
    return (
      <Button size="lg" variant="outline" className="font-bold border-green-500 text-green-600 bg-green-50 hover:bg-green-100 cursor-default">
        <CheckCircle2 className="mr-2 h-4 w-4" /> Joined
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={handleJoin} disabled={loading} className="font-bold shadow-lg">
      {loading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
      ) : (
        <><UserPlus className="mr-2 h-4 w-4" /> Join Community</>
      )}
    </Button>
  );
}
