'use client'

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, BookOpen, Users, Trophy, ChevronRight, Clock, Star, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface DashboardData {
  enrolledCourses: number;
  communities: number;
  stats: {
    streak: number;
    rank: string;
  };
  enrolledCoursesList: {
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
    const router = useRouter();

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

    const handleExploreCourses = () => {
      router.push("/courses");
    };

    const handleManageCourses = () => {
      router.push("/dashboard/courses");
    };

    const handleCreateCourse = () => {
      router.push("/courses/create");
    };

    if (userLoading || (user && loading)) {
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                 <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-4">
                 <Skeleton className="h-96 w-full rounded-2xl" />
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
            <Button onClick={() => router.push('/login')} className="cursor-pointer">Log In Now</Button>
          </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground mt-1">Ready to learn or teach something new today?</p>
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
                  value={data?.enrolledCourses || 0} 
                  icon={BookOpen} 
                  color="text-blue-500" 
                  bg="bg-blue-500/10" 
                />
                <StatsCard 
                  title="Communities" 
                  value={data?.communities || 0} 
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
              <div className="lg:col-span-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Your Learning Progress</h2>
                    <Button variant="outline" size="sm" onClick={handleExploreCourses} className="font-bold cursor-pointer">
                      Explore Courses
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {data?.enrolledCoursesList.length === 0 ? (
                      <Card className="rounded-2xl border-dashed">
                        <CardContent className="p-10 text-center space-y-4">
                          <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
                          <Button onClick={handleExploreCourses} variant="outline" className="font-bold cursor-pointer">
                            Explore Courses
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      data?.enrolledCoursesList.map(course => (
                        <CourseProgressCard 
                          key={course.id}
                          id={course.id}
                          title={course.title} 
                          progress={course.progress} 
                          nextLesson={course.nextLesson || "Next module"} 
                          onContinue={() => router.push(`/courses/${course.id}/learn`)}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Course Management</h2>
                    <Button size="sm" className="gap-2 font-bold cursor-pointer" onClick={handleCreateCourse}>
                      <Plus className="h-4 w-4" /> Create Course
                    </Button>
                  </div>
                  <Card className="rounded-2xl shadow-sm border-primary/5">
                      <CardContent className="p-10 text-center space-y-4">
                          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="space-y-2">
                            <p className="font-black text-lg">Become a Creator</p>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                              Anyone can create a course on SkillConnect. Earn 50 coins for every course you publish!
                            </p>
                          </div>
                          <Button variant="outline" onClick={handleManageCourses} className="font-bold cursor-pointer">Manage Your Courses</Button>
                      </CardContent>
                  </Card>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <ActivitySidebar activities={data?.activities || []} onViewWallet={() => router.push('/dashboard/wallet')} />
              </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm bg-card transition-transform hover:scale-[1.02] rounded-2xl">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
              <h3 className="text-2xl font-black mt-1">{value}</h3>
            </div>
        </CardContent>
    </Card>
  );
}

function CourseProgressCard({ title, progress, nextLesson, onContinue }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-primary/5 group transition-all hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-grow">
            <h4 className="font-black text-lg group-hover:text-primary transition-colors">{title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{nextLesson}</span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                <span>Overall Progress</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <Button onClick={onContinue} className="w-full sm:w-auto font-bold h-12 px-6 cursor-pointer">
                Continue <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitySidebar({ activities, onViewWallet }: { activities: any[], onViewWallet: () => void }) {
  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? formatDistanceToNow(date, { addSuffix: true }) : 'Recently';
  };

  return (
    <Card className="rounded-2xl shadow-sm border-primary/5 sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-black">Recent Activity</CardTitle>
        <CardDescription>Stay up to date with your tribe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 italic">No recent activity found.</p>
        ) : (
          activities.map((item, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-150 transition-transform" />
              <div className="space-y-1">
                <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{item.text}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateSafe(item.date)}
                </p>
              </div>
            </div>
          ))
        )}
        <Button variant="ghost" onClick={onViewWallet} className="w-full text-primary text-xs h-8 font-bold hover:bg-primary/5 hover:text-zinc-800 cursor-pointer">
            View Coin History
        </Button>
      </CardContent>
    </Card>
  );
}
