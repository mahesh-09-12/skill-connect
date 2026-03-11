
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Settings, 
  Shield, 
  Users, 
  MessageSquare, 
  ExternalLink,
  Edit,
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
  } catch (error) { return null; }
}

export default async function CommunityManagementPage({ params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      _count: { select: { members: true, posts: true } }
    },
  });

  if (!community) notFound();

  // In this MVP, we consider any member as "manager" for demo, or you can check creatorId if it exists in schema
  // For now let's just display stats and settings buttons

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/communities" 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Communities
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href={`/communities/${community.id}`} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> Go to Feed
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary">{community.category}</Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
               <Shield className="h-3 w-3" /> Moderator Access
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{community.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{community.description}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/communities/${community.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" /> Edit Community Settings
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Member Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-bold">{community._count.members}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">New this week</span>
                <span className="font-bold text-green-600">+12</span>
             </div>
             <Button variant="outline" className="w-full mt-4">Manage Members</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Content Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Posts</span>
                <span className="font-bold">{community._count.posts}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pending Reports</span>
                <span className="font-bold text-red-600">0</span>
             </div>
             <Button variant="outline" className="w-full mt-4">Review Posts</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
