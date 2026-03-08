'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, BookOpen, Users, Trophy, ChevronRight, Clock, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface DashboardData {
  stats: {
    courseCount: number;
    communityCount: number;
    streak: number;
    rank: string;
  };
  enrolledCourses: {
    id: string;
    title: string;
    progress: number;
    nextLesson?: string;
  }[];
  activities: {
    text: string;
    date: string;
    type: string;
  }[];
}

export default function DashboardPage() {
    const { user, isLoading: userLoading } = useUser();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            async function fetchStats() {
                try {
                    const res = await fetch('/api/dashboard/stats');
                    if (res.ok) {
                        const statsData = await res.json();
                        setData(statsData);
                    }
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error);
                } finally {
                    setLoading(false);
                }
            }
            fetchStats();
        }
    }, [user]);

    if (userLoading || (user && loading)) {
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                 <Skeleton className="h-64 w-full" />
              </div>
              <div className="lg:col-span-4">
                 <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        );
    }

    if (!user) {
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground max-w-sm">Please log in to view your personalized dashboard and progress.</p>
            <Button asChild>
              <Link href="/login">Log In Now</Link>
            </Button>
          </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground mt-1">Ready to learn something new today?</p>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/20">
                <Coins className="h-5 w-5 fill-current" />
                <span className="font-extrabold text-lg">{user.coinBalance}</span>
                <span className="text-xs font-medium ml-1 opacity-80">Coins</span>
              </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Courses Joined" 
                  value={data?.stats.courseCount || 0} 
                  icon={BookOpen} 
                  color="text-blue-500" 
                  bg="bg-blue-500/10" 
                />
                <StatsCard 
                  title="Communities" 
                  value={data?.stats.communityCount || 0} 
                  icon={Users} 
                  color="text-purple-500" 
                  bg="bg-purple-500/10" 
                />
                <StatsCard 
                  title="Current Streak" 
                  value={`${data?.stats.streak || 0} Days`} 
                  icon={Star} 
                  color="text-orange-500" 
                  bg="bg-orange-500/10" 
                />
                <StatsCard 
                  title="Global Rank" 
                  value={data?.stats.rank || "N/A"} 
                  icon={Trophy} 
                  color="text-green-500" 
                  bg="bg-green-500/10" 
                />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                {user.role === 'LEARNER' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Your Learning Progress</h2>
                    <div className="grid gap-4">
                      {data?.enrolledCourses.length === 0 ? (
                        <Card>
                          <CardContent className="p-10 text-center space-y-4">
                            <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                            <Button asChild variant="outline">
                              <Link href="/courses">Explore Courses</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        data?.enrolledCourses.map(course => (
                          <CourseProgressCard 
                            key={course.id}
                            id={course.id}
                            title={course.title} 
                            progress={course.progress} 
                            nextLesson={course.nextLesson || "Next module"} 
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
                {user.role === 'CREATOR' && <CreatorDashboard />}
                {user.role === 'ADMIN' && <AdminDashboard />}
              </div>
              <div className="lg:col-span-4 space-y-6">
                <ActivitySidebar activities={data?.activities || []} />
              </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm bg-card transition-transform hover:scale-[1.02]">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
        </CardContent>
    </Card>
  );
}

function CourseProgressCard({ title, progress, nextLesson, id }: any) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-grow">
            <h4 className="font-bold text-lg">{title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{nextLesson}</span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Overall Progress</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/courses/${id}`}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySidebar({ activities }: { activities: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Stay up to date with your tribe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No recent activity found.</p>
        ) : (
          activities.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-tight">{item.text}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <Button variant="ghost" asChild className="w-full text-primary text-xs h-8">
            <Link href="/dashboard/wallet">View Coin History</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
  
function CreatorDashboard() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Course Management</h2>
            <Card>
                <CardContent className="p-10 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <p className="text-muted-foreground">You haven't created any courses yet.</p>
                    <Button>Create Your First Course</Button>
                </CardContent>
            </Card>
        </div>
    );
}

function AdminDashboard() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Admin Controls</h2>
            <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">User and course management tools are currently in maintenance.</p>
                </CardContent>
            </Card>
        </div>
    );
}
