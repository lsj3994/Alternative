'use client';

import { useState, useEffect } from 'react';

interface VoteResultBarProps {
  percent: number;
  isWinner: boolean;
  animate?: boolean;
}

export default function VoteResultBar({
  percent,
  isWinner,
  animate = true,
}: VoteResultBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(percent), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(percent);
    }
  }, [percent, animate]);

  return (
    <div className="w-full h-3 rounded-full bg-surface-hover overflow-hidden">
      <div
        className={`h-full rounded-full vote-bar-fill relative ${
          isWinner ? 'winner' : 'bg-text-muted/30'
        }`}
        style={{ width: `${width}%` }}
      >
        {/* Shimmer effect on winner */}
        {isWinner && width > 0 && (
          <div className="absolute inset-0 animate-shimmer rounded-full" />
        )}
      </div>
    </div>
  );
}
