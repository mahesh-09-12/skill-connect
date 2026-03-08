'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AnimatedBackground from './animated-background';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-16 lg:py-24">
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <motion.div
            className="flex-1 text-center lg:text-left space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="py-1 px-3">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                Now in Public Beta
              </Badge>
            </motion.div>
            
            <motion.h1
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight"
              variants={itemVariants}
            >
              Skill Exchange + <span className="text-primary">Community</span>-Driven Learning
            </motion.h1>
            
            <motion.p
              className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground leading-relaxed"
              variants={itemVariants}
            >
              The language-first, gamified platform to learn new skills, connect
              with experts, and grow with a global community.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
              variants={itemVariants}
            >
              <Button asChild size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-bold shadow-lg shadow-primary/20">
                <Link href="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-12 text-base font-bold border bg-muted text-foreground hover:bg-muted/80 transition-colors">
                <Link href="/communities">Join Community</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative aspect-square sm:aspect-[16/10] lg:aspect-square w-full max-w-[500px] mx-auto lg:ml-auto">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl -rotate-3 transition-transform hover:rotate-0 duration-500" />
              <div className="absolute inset-0 bg-accent/10 rounded-3xl rotate-2 transition-transform hover:rotate-0 duration-500" />
              <div className="relative h-full w-full overflow-hidden rounded-3xl border shadow-2xl bg-card">
                 <Image 
                  src="https://picsum.photos/seed/skillconnect/800/800"
                  alt="SkillConnect Learning Experience"
                  fill
                  className="object-cover"
                  data-ai-hint="online learning"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
