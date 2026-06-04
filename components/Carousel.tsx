'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const goTo = useCallback(
    (index: number) => setCurrentIndex(index),
    []
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  // Auto-advance — pauses on hover
  useEffect(() => {
    if (!items.length || isHovered) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, isHovered]);

  if (loading || !items.length) return null;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full my-8 overflow-hidden rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.22)] ring-1 ring-white/10"
    >
      <div className="relative w-full h-52 md:h-80 lg:h-[500px] bg-neutral-900">

        {/*
          ALL slides are rendered at once and stacked.
          Active slide → opacity 1 / z-index 20
          All others   → opacity 0 / z-index 1
          This guarantees every image is fetched by the browser immediately.
          Transition = smooth crossfade + blur, never a black/white frame.
        */}
        {items.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <motion.div
              key={item.id}
              aria-hidden={!isActive}
              animate={{
                opacity: isActive ? 1 : 0,
                filter: isActive ? 'blur(0px)' : 'blur(8px)',
                zIndex: isActive ? 20 : 1,
              }}
              transition={{
                opacity: { duration: 0.75, ease: 'easeInOut' },
                filter: { duration: 0.75, ease: 'easeInOut' },
              }}
              className="absolute inset-0"
            >
              {/* Ken-Burns zoom only for the active slide */}
              <motion.div
                key={isActive ? `active-${index}` : `idle-${index}`}
                initial={{ scale: 1 }}
                animate={{ scale: isActive ? 1.07 : 1 }}
                transition={{ duration: 12, ease: 'linear' }}
                className="relative w-full h-full"
              >
                <Image
                  loader={imageKitLoader}
                  src={item.image_url}
                  alt={`Slide ${index + 1}`}
                  fill
                  priority={index < 2}
                  quality={100}
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, (max-width:1200px) 90vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
              </motion.div>
            </motion.div>
          );
        })}

        {/* Controls */}
        {items.length > 1 && (
          <>
            {/* Prev button */}
            <motion.button
              onClick={handlePrev}
              aria-label="Previous Slide"
              whileHover={{ scale: 1.12, backgroundColor: 'rgba(255,255,255,0.22)' }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="
                absolute left-4 top-1/2 -translate-y-1/2 z-30
                bg-white/10 backdrop-blur-2xl border border-white/25
                p-3 rounded-full text-white
                shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              "
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </motion.button>

            {/* Next button */}
            <motion.button
              onClick={handleNext}
              aria-label="Next Slide"
              whileHover={{ scale: 1.12, backgroundColor: 'rgba(255,255,255,0.22)' }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="
                absolute right-4 top-1/2 -translate-y-1/2 z-30
                bg-white/10 backdrop-blur-2xl border border-white/25
                p-3 rounded-full text-white
                shadow-[0_8px_32px_rgba(0,0,0,0.3)]
              "
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </motion.button>

            {/* Dots */}
            <div
              className="
                absolute bottom-4 left-1/2 -translate-x-1/2 z-30
                flex items-center gap-1.5 md:gap-2
                px-3 py-1.5 md:px-4 md:py-2 rounded-full
                bg-black/20 backdrop-blur-xl
                border border-white/15
              "
            >
              {items.map((_, index) => {
                const active = index === currentIndex;
                return (
                  <motion.button
                    key={index}
                    layout
                    onClick={() => goTo(index)}
                    aria-label={`Slide ${index + 1}`}
                    animate={{
                      width: active ? 20 : 6,
                      opacity: active ? 1 : 0.45,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="h-1.5 md:h-2 rounded-full bg-white"
                    style={{ minWidth: 6 }}
                  />
                );
              })}
            </div>


          </>
        )}
      </div>
    </motion.div>
  );
}