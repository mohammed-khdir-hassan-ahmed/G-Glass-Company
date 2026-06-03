'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { imageKitLoader } from '@/lib/imagekit-loader';

interface CarouselItem {
  id: number;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

export default function Carousel() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left/prev, 1 for right/next
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/carousel');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching carousel:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate every 5 seconds (smooth and premium feel)
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (loading || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Slide & Zoom animations variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : dir < 0 ? '-100%' : '0%',
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: '0%',
      opacity: 1,
      scale: 1,
      zIndex: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : dir > 0 ? '-100%' : '0%',
      opacity: 0,
      scale: 0.96,
      zIndex: 0,
    }),
  };

  return (
    <div className="w-full my-6 rounded-xl overflow-hidden shadow-xl bg-white border border-gray-100/50">
      <div className="relative w-full h-44 md:h-80 lg:h-96 bg-gray-950 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 220, damping: 26 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.35, ease: 'easeOut' },
            }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Premium Ken Burns slow-zoom animation */}
            <motion.div
              key={`zoom-${currentIndex}`}
              initial={{ scale: 1 }}
              animate={{ scale: 1.06 }}
              transition={{
                duration: 6,
                ease: 'easeOut',
              }}
              className="relative w-full h-full"
            >
              <Image
                loader={imageKitLoader}
                src={currentItem.image_url}
                alt="carousel"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
              {/* Premium dark gradient overlay for better contrast and depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons with premium glassmorphism design */}
        {items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white hover:text-black hover:scale-105 active:scale-95 p-2 md:p-3 rounded-full transition-all duration-300 z-10 shadow-lg border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white hover:text-black hover:scale-105 active:scale-95 p-2 md:p-3 rounded-full transition-all duration-300 z-10 shadow-lg border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            {/* Dot Indicators with active pills animations */}
            <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10 bg-black/25 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
              {items.map((_, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className="relative h-2 rounded-full focus:outline-none transition-all duration-300"
                    style={{
                      width: isActive ? '20px' : '8px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
