'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollButtons() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 md:right-8 bottom-20 md:bottom-24 w-12 h-12 md:w-14 md:h-14 bg-[#000000] hover:bg-[#1a1a1a] text-white rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-50"
          title="بۆ سەرەوە"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      )}
    </>
  );
}

