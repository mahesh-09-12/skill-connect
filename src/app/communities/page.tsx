
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CommunityCard from '@/components/community-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Community } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities');
        if (res.ok) {
          const data = await res.json();
          setCommunities(Array.isArray(data) ? data : []);
        } else {
          const errorData = await res.json().catch(() => null);
          console.error("Failed to fetch communities:", res.status, errorData?.message || res.statusText);
          setCommunities([]);
        }
      } catch (error) {
        console.error("Failed to fetch communities", error);
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter(community => {
    return (
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === 'all' || community.category === categoryFilter)
    );
  });
  
  const categories = ['all', ...Array.from(new Set(communities.map(c => c.category)))];

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Tribe</h1>
        <p className="text-muted-foreground">
          Connect with peers, mentors, and friends in our vibrant communities.
        </p>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full" />)}
        </div>
      ) : (
        <motion.div
            layout
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
            <AnimatePresence>
            {filteredCommunities.map((community) => (
                <motion.div
                key={community.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <CommunityCard community={community} />
                </motion.div>
            ))}
            </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
