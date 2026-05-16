'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGGRO_COPIES } from '@/lib/data';

export default function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const rotate = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % AGGRO_COPIES.length);
      setIsVisible(true);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotate, 4000);
    return () => clearInterval(interval);
  }, [rotate]);

  return (
    <div className="h-8 flex items-center justify-center overflow-hidden">
      <p
        className={`text-sm md:text-base font-medium text-text-secondary text-center transition-all duration-400 ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-5'
        }`}
        style={{ transitionDuration: '400ms' }}
      >
        <span className="text-accent">&quot;</span>
        {AGGRO_COPIES[currentIndex]}
        <span className="text-accent">&quot;</span>
      </p>
    </div>
  );
}
