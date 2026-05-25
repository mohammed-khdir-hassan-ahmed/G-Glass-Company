declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    angle?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: ('square' | 'circle')[];
    scalar?: number;
    ticks?: number;
  }

  function confetti(options?: ConfettiOptions): Promise<null>;

  export default confetti;
}
