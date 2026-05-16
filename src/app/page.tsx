'use client';

import { useState, useEffect } from 'react';
import { Flame, Clock, BarChart3, Sparkles } from 'lucide-react';
import PollCard from '@/components/poll/PollCard';
import RotatingText from '@/components/ui/RotatingText';
import { DUMMY_POLLS, CATEGORIES } from '@/lib/data';
import { getUserPolls } from '@/lib/store';
import { Poll } from '@/lib/types';

type SortMode = 'popular' | 'latest' | 'active';

export default function HomePage() {
  const [category, setCategory] = useState('전체');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [allPolls, setAllPolls] = useState<Poll[]>(DUMMY_POLLS);

  useEffect(() => {
    // 클라이언트 사이드에서 유저 투표 불러와서 합치기
    const userPolls = getUserPolls();
    setAllPolls([...userPolls, ...DUMMY_POLLS]);
  }, []);

  const filtered = allPolls.filter(
    (p) => category === '전체' || p.category === category
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'popular') return b.totalVotes - a.totalVotes;
    if (sortMode === 'latest')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // active: active first, then by votes
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return b.totalVotes - a.totalVotes;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-4">
          <Sparkles size={14} />
          대한민국 No.1 투표 토론 플랫폼
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
          <span className="gradient-text">방구석</span>{' '}
          <span className="text-text-primary">백분토론</span>
        </h1>
        <p className="text-text-secondary text-base md:text-lg mb-4 max-w-xl mx-auto">
          논쟁은 댓글이 아니라 <strong className="text-primary">투표</strong>로
          해결합니다. 지금 참여하세요!
        </p>
        <RotatingText />
      </section>

      {/* Filters */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`pill ${category === cat ? 'active' : ''}`}
              id={`category-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortMode('popular')}
            className={`flex items-center gap-1 pill ${
              sortMode === 'popular' ? 'active' : ''
            }`}
            id="sort-popular"
          >
            <Flame size={13} />
            인기순
          </button>
          <button
            onClick={() => setSortMode('latest')}
            className={`flex items-center gap-1 pill ${
              sortMode === 'latest' ? 'active' : ''
            }`}
            id="sort-latest"
          >
            <Clock size={13} />
            최신순
          </button>
          <button
            onClick={() => setSortMode('active')}
            className={`flex items-center gap-1 pill ${
              sortMode === 'active' ? 'active' : ''
            }`}
            id="sort-active"
          >
            <BarChart3 size={13} />
            진행중
          </button>
        </div>
      </section>

      {/* Poll Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sorted.map((poll, i) => (
          <PollCard key={poll.id} poll={poll} index={i} />
        ))}
      </section>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-text-muted">
          <p className="text-4xl mb-4">🤷</p>
          <p className="text-lg">해당 카테고리에 투표가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
