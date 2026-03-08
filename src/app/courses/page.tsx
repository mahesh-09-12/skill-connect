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
import { Search } from 'lucide-react';

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
        const data = await res.json();

        if (res.ok && data.success && Array.isArray(data.courses)) {
            setCourses(data.courses);
        }
      } catch (error) {
        console.error("Network error while fetching courses", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    return (
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (languageFilter === 'all' || course.language === languageFilter) &&
      (levelFilter === 'all' || course.level === levelFilter)
    );
  }) : [];

  const languages = ['all', ...Array.from(new Set(courses.map(c => c.language)))];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Courses</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Find your next learning adventure from our curated list of courses designed by experts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 lg:flex gap-4">
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Language" />
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
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Level" />
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
      </div>

      {loading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] w-full" />)}
        </div>
      ) : (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
            <AnimatePresence>
            {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                >
                <CourseCard course={course} />
                </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center border rounded-xl bg-muted/20">
                <p className="text-xl text-muted-foreground">No courses found matching your filters.</p>
              </div>
            )}
            </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
