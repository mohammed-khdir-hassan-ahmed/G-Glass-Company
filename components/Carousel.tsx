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
  const [direction, setDirection] = useState(0);
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

  useEffect(() => {
    if (!items.length) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (loading || !items.length) return null;

  const currentItem = items[currentIndex];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + items.length) % items.length
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(
      (prev) => (prev + 1) % items.length
    );
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 1.03,
      filter: 'blur(8px)',
    }),

    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },

    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.98,
      filter: 'blur(8px)',
    }),
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.01,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        w-full
        my-8
        overflow-hidden
        rounded-3xl
        bg-white
        border
        border-white/20
        shadow-[0_20px_80px_rgba(0,0,0,0.18)]
      "
    >
      <div className="relative w-full h-52 md:h-80 lg:h-[500px] overflow-hidden bg-black">

        <AnimatePresence
          initial={false}
          custom={direction}
          mode="wait"
        >
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: 'spring',
                stiffness: 90,
                damping: 22,
              },
              opacity: {
                duration: 0.6,
              },
              scale: {
                duration: 0.7,
              },
              filter: {
                duration: 0.7,
              },
            }}
            className="absolute inset-0"
          >
            <motion.div
              key={`zoom-${currentIndex}`}
              initial={{
                scale: 1,
              }}
              animate={{
                scale: 1.12,
              }}
              transition={{
                duration: 10,
                ease: 'linear',
              }}
              className="relative w-full h-full"
            >
              <Image
                loader={imageKitLoader}
                src={currentItem.image_url}
                alt={`Slide ${currentIndex + 1}`}
                fill
                priority
                className="object-cover"
                sizes="
                  (max-width:768px) 100vw,
                  (max-width:1200px) 90vw,
                  1200px
                "
              />

              {/* Premium overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                z-20

                bg-white/10
                backdrop-blur-xl
                border
                border-white/20

                p-3
                rounded-full

                text-white

                shadow-[0_8px_30px_rgba(0,0,0,0.25)]

                hover:bg-white/20
                hover:scale-110

                active:scale-95

                transition-all
                duration-500
              "
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              aria-label="Next Slide"
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                z-20

                bg-white/10
                backdrop-blur-xl
                border
                border-white/20

                p-3
                rounded-full

                text-white

                shadow-[0_8px_30px_rgba(0,0,0,0.25)]

                hover:bg-white/20
                hover:scale-110

                active:scale-95

                transition-all
                duration-500
              "
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div
              className="
                absolute
                bottom-6
                left-1/2
                -translate-x-1/2
                z-20

                flex
                items-center
                gap-2

                px-4
                py-2

                rounded-full

                bg-white/10
                backdrop-blur-xl

                border
                border-white/10
              "
            >
              {items.map((_, index) => {
                const active = index === currentIndex;

                return (
                  <motion.button
                    key={index}
                    layout
                    onClick={() =>
                      handleDotClick(index)
                    }
                    aria-label={`Slide ${index + 1}`}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={`
                      h-2
                      rounded-full
                      transition-all
                      duration-300
                      ${
                        active
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/40'
                      }
                    `}
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