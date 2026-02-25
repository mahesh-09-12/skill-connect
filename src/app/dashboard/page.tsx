
'use client'
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>Please log in to view your dashboard.</div>
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Coin Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{user.coinBalance}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Further dashboard content based on role */}
            {user.role === 'LEARNER' && <LearnerDashboard />}
            {user.role === 'CREATOR' && <CreatorDashboard />}
            {user.role === 'ADMIN' && <AdminDashboard />}
        </div>
    );
}


function LearnerDashboard() {
    // Fetch and display enrolled courses, recent activity, etc.
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Learning</h2>
        <Card>
            <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
            <CardContent>
                <p>Enrolled courses will appear here.</p>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  function CreatorDashboard() {
    // Fetch and display created courses, community stats, etc.
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Your Creations</h2>
            <Card>
                <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
                <CardContent>
                    <p>Created courses will appear here.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  function AdminDashboard() {
    // Fetch and display user list, course list, etc.
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <Card>
                <CardHeader><CardTitle>Manage Users</CardTitle></CardHeader>
                <CardContent>
                    <p>User management tools will be here.</p>
                </CardContent>
            </Card>
        </div>
    );
  }
