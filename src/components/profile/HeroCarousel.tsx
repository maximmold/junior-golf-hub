import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Award, Star, GraduationCap, Target } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 'all-region',
    title: '2026 All-Region Team',
    subtitle: '5A Region 7 • Wando High School',
    icon: <Trophy className="w-8 h-8" />,
    gradient: 'from-amber-600 to-orange-700'
  },
  {
    id: 'lake-city',
    title: '3rd Place, Lake City',
    subtitle: 'Score: 71 (Best Round)',
    icon: <Award className="w-8 h-8" />,
    gradient: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'myrtle-beach',
    title: '3rd Place, Myrtle Beach National',
    subtitle: 'Score: 73',
    icon: <Star className="w-8 h-8" />,
    gradient: 'from-blue-600 to-cyan-700'
  },
  {
    id: 'uskg-fall',
    title: 'US Kids Charleston Fall 2026',
    subtitle: '2nd Place • Level 7 Priority Status',
    icon: <Target className="w-8 h-8" />,
    gradient: 'from-purple-600 to-pink-700'
  },
  {
    id: 'op36',
    title: 'Operation 36 Graduate',
    subtitle: 'Level 6 Complete • Oct 2025',
    icon: <GraduationCap className="w-8 h-8" />,
    gradient: 'from-indigo-600 to-purple-700'
  },
  {
    id: 'state-qualifier',
    title: 'SCHSL State Qualifier',
    subtitle: 'Varsity as 8th Grader • Spring 2026',
    icon: <Trophy className="w-8 h-8" />,
    gradient: 'from-rose-600 to-red-700'
  }
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const prefersReducedMotion = useRef(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || prefersReducedMotion.current) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const currentSlideData = SLIDES[currentSlide];

  return (
    <div 
      className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Content */}
      <div className="relative h-48 sm:h-56 flex items-center justify-center p-6 sm:p-8">
        {/* Animated Gradient Background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-90 transition-all duration-700 ease-in-out`}
          style={{ transform: `scale(${isPaused ? 1.05 : 1})` }}
        />
        
        {/* Decorative Circles */}
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
              {currentSlideData.icon}
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            {currentSlideData.title}
          </h2>
          <p className="text-sm sm:text-base text-white/80 font-medium">
            {currentSlideData.subtitle}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all z-20 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all z-20 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
