'use client';

import { useEffect, useState } from 'react';


export default function Celebration() {
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (hasPlayed) return;

    // Dynamically import canvas-confetti
    import('canvas-confetti').then((module: any) => {
      const confetti = module.default;

      // Play confetti animation on page load
      const timer = setTimeout(() => {
        // Rainbow spiral - confetti from all edges
        
        // Top center - big burst
        confetti({
          particleCount: 120,
          spread: 120,
          origin: { x: 0.5, y: -0.1 },
          colors: ['#000000', '#FFD700', '#FF6B6B', '#4ECDC4', '#FF1493', '#95E1D3'],
          gravity: 0.8,
          scalar: 1.2,
          ticks: 300,
        });

        // Bottom left cannon
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { x: 0.1, y: 1.1 },
            colors: ['#000000', '#FF6B6B', '#4ECDC4'],
            gravity: -0.3,
            scalar: 1,
            ticks: 260,
          });
        }, 150);

        // Bottom right cannon
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { x: 0.9, y: 1.1 },
            colors: ['#FFD700', '#FF1493', '#95E1D3'],
            gravity: -0.3,
            scalar: 1,
            ticks: 260,
          });
        }, 300);

        // Center burst - middle stage
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#000000', '#FFD700', '#4ECDC4', '#FF1493'],
            gravity: 0.5,
            scalar: 0.5,
            ticks: 280,
          });
        }, 450);

        setHasPlayed(true);
      }, 300);

      return () => clearTimeout(timer);
    });
  }, [hasPlayed]);

  return null;
}

