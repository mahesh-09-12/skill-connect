
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
import CourseCard from '@/components/course-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } else {
            const errorData = await res.json().catch(() => null);
            console.error("Failed to fetch courses:", res.status, errorData?.message || res.statusText);
            setCourses([]);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    return (
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (languageFilter === 'all' || course.language === languageFilter) &&
      (levelFilter === 'all' || course.level === levelFilter)
    );
  });

  const languages = ['all', ...Array.from(new Set(courses.map(c => c.language)))];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Explore Courses</h1>
        <p className="text-muted-foreground">
          Find your next learning adventure from our curated list of courses.
        </p>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-1"
        />
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map(lang => (
              <SelectItem key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map(level => (
              <SelectItem key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full" />)}
        </div>
      ) : (
        <motion.div
            layout
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
            <AnimatePresence>
            {filteredCourses.map((course) => (
                <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                >
                <CourseCard course={course} />
                </motion.div>
            ))}
            </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
