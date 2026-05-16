'use client';

interface BadgeProps {
  label: string;
  emoji?: string;
  color?: string;
  size?: 'sm' | 'md';
}

const BADGE_COLORS = [
  'bg-blue-500/10 text-blue-600 border-blue-500/15',
  'bg-teal-500/10 text-teal-600 border-teal-500/15',
  'bg-orange-500/10 text-orange-600 border-orange-500/15',
  'bg-rose-500/10 text-rose-600 border-rose-500/15',
  'bg-slate-500/10 text-slate-600 border-slate-500/15',
];

export default function Badge({ label, emoji, color, size = 'sm' }: BadgeProps) {
  // 라벨 기반으로 일관된 색상 선택
  const colorIndex = label
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % BADGE_COLORS.length;
  const colorClass = color || BADGE_COLORS[colorIndex];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colorClass} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {emoji && <span>{emoji}</span>}
      {label} 선택
    </span>
  );
}
