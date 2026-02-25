'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, ArrowUpRight, ArrowDownLeft, History, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletPage() {
  const { user, isLoading: userLoading } = useUser();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/wallet/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user]);

  const handleDailyCheckin = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/auth/daily-checkin', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast({
          title: "Coins Collected!",
          description: data.message,
        });
        fetchWalletData();
        // Force refresh user balance via a router or global state if needed
        // For now, let's just assume the UI updates on next fetch
        window.location.reload();
      } else {
        toast({
          variant: "destructive",
          title: "Already Claimed",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to collect daily reward.",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (userLoading || loading) {
    return <div className="space-y-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">Manage your coins and view transaction history.</p>
        </div>
        <Button 
          onClick={handleDailyCheckin} 
          disabled={claiming}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg"
        >
          {claiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Claim Daily Reward
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card className="bg-primary text-primary-foreground border-none shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Coins className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-medium opacity-80">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <Coins className="h-10 w-10 text-yellow-400" />
              <span className="text-5xl font-black">{user?.coinBalance || 0}</span>
            </div>
            <p className="text-sm opacity-70">Use coins to enroll in expert-led courses.</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-lg">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Earned</span>
              <span className="font-bold text-green-600">
                +{transactions.filter(t => t.type === 'EARN').reduce((acc, t) => acc + t.amount, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-bold text-red-600">
                {transactions.filter(t => t.type === 'SPEND').reduce((acc, t) => acc + t.amount, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-muted-foreground">No transactions found.</p>
              <Button variant="outline" size="sm" onClick={handleDailyCheckin}>Start earning coins</Button>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((t) => (
                <div key={t.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${t.type === 'EARN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'EARN' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-base">{t.reason}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'MMM d, yyyy • h:mm a')}</p>
                    </div>
                  </div>
                  <div className={`font-black ${t.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'EARN' ? '+' : ''}{t.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
