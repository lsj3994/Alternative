'use client';

import { useState, useEffect } from 'react';
import { Flame, Clock, BarChart3, Sparkles } from 'lucide-react';
import PollCard from '@/components/poll/PollCard';
import RotatingText from '@/components/ui/RotatingText';
import { DUMMY_POLLS, CATEGORIES, fetchAllPolls } from '@/lib/data';
import { Poll } from '@/lib/types';

type SortMode = 'popular' | 'latest' | 'active';

function SessionToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const created = sessionStorage.getItem('poll_created');
      const signup = sessionStorage.getItem('signup_success');
      const login = sessionStorage.getItem('login_success');
      const withdrawal = sessionStorage.getItem('withdrawal_success');

      if (created === '1') {
        setMessage('🎉 투표가 개설되었습니다!');
        sessionStorage.removeItem('poll_created');
      } else if (signup === '1') {
        setMessage('🎉 회원가입이 완료되었습니다!');
        sessionStorage.removeItem('signup_success');
      } else if (login === '1') {
        setMessage('👋 로그인에 성공했습니다!');
        sessionStorage.removeItem('login_success');
      } else if (withdrawal === '1') {
        setMessage('👋 탈퇴 처리가 완료되었습니다. 이용해주셔서 감사합니다.');
        sessionStorage.removeItem('withdrawal_success');
      }

      if (created === '1' || signup === '1' || login === '1' || withdrawal === '1') {
        const t = setTimeout(() => setMessage(null), 4000);
        return () => clearTimeout(t);
      }
    }
  }, []);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl bg-green-500 text-white font-bold shadow-xl flex items-center gap-2 animate-fade-in-up">
      {message}
    </div>
  );
}

export default function HomePage() {
  const [category, setCategory] = useState('전체');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [allPolls, setAllPolls] = useState<Poll[]>(DUMMY_POLLS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPolls() {
      setIsLoading(true);
      try {
        const polls = await fetchAllPolls();
        if (!cancelled) {
          setAllPolls(polls);
        }
      } catch (err) {
        console.warn('투표 목록 로드 실패:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPolls();
    return () => { cancelled = true; };
  }, []);

  const filtered = allPolls.filter((p) => {
    const isUserDeleted = p.description?.startsWith('[USER_DELETED]');
    const matchesCategory = category === '전체' || p.category === category;
    return !isUserDeleted && matchesCategory;
  });

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
      {/* 세션 알림 토스트 */}
      <SessionToast />

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
      {isLoading ? (
        <div className="text-center py-20 text-text-muted animate-pulse">
          <p className="text-4xl mb-4">🔄</p>
          <p className="text-lg">투표 목록을 불러오는 중...</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((poll, i) => (
            <PollCard key={poll.id} poll={poll} index={i} />
          ))}
        </section>
      )}

      {!isLoading && sorted.length === 0 && (
        <div className="text-center py-20 text-text-muted">
          <p className="text-4xl mb-4">🤷</p>
          <p className="text-lg">해당 카테고리에 투표가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
