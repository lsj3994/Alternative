'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, Smile } from 'lucide-react';
import { getUser } from '@/lib/store';
import { canUseSupabase, dbFetchOpinions, dbCreateOpinion, dbLikeOpinion } from '@/lib/supabase-db';

interface Opinion {
  id: string;
  name: string;
  content: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  emoji: string;
  likes: number;
  createdAt: string;
}

const COLOR_MAP = {
  blue: {
    card: 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30 text-blue-800 dark:text-blue-200',
    dot: 'bg-blue-500',
    pill: 'border-blue-200 bg-blue-50 text-blue-600',
  },
  orange: {
    card: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-200',
    dot: 'bg-amber-500',
    pill: 'border-amber-200 bg-amber-50 text-amber-600',
  },
  green: {
    card: 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  purple: {
    card: 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-900/30 text-purple-800 dark:text-purple-200',
    dot: 'bg-purple-500',
    pill: 'border-purple-200 bg-purple-50 text-purple-600',
  },
};

const EMOJIS = ['🗳️', '💬', '🔥', '⚽', '🍜', '🏔️', '🍫', '🍎', '🤔', '😎', '💡', '🚨', '👾', '🚀'];

const DUMMY_OPINIONS: Opinion[] = [
  {
    id: 'dummy-op-1',
    name: '민초사관',
    content: '민초는 치약이 아닙니다! 상큼하고 깔끔한 초코의 맛, 인류 최고의 발명품입니다 🍫🌱',
    color: 'green',
    emoji: '🍫',
    likes: 42,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-op-2',
    name: '축구사랑',
    content: '박지성의 미친 체력과 헌신, 손흥민의 월드클래스 감아차기... 둘의 전성기를 다 보다니 영광입니다! ⚽',
    color: 'blue',
    emoji: '⚽',
    likes: 31,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-op-3',
    name: '진격의부먹',
    content: '탕수육은 원래 소스를 부어서 튀김옷의 눅눅함과 쫀득함을 조화롭게 먹는 고급 요리입니다. 부먹 승리! 🫗',
    color: 'orange',
    emoji: '🍜',
    likes: 15,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dummy-op-4',
    name: '애플조아',
    content: '맥북으로 작업하다가 아이패드로 필기하고 아이폰으로 전화 받으면 애플 생태계에서 영원히 나갈 수 없어요 🍎',
    color: 'purple',
    emoji: '🍎',
    likes: 24,
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
  },
];

export default function OpinionsPage() {
  const [name, setName] = useState('익명 토론러');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<'blue' | 'orange' | 'green' | 'purple'>('blue');
  const [emoji, setEmoji] = useState('💬');
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 의견 데이터 로드 함수
  const loadOpinions = async () => {
    setIsLoading(true);
    let list: Opinion[] = [];

    // 1. Supabase 사용 가능 시 시도
    if (canUseSupabase()) {
      try {
        const dbList = await dbFetchOpinions();
        if (dbList && dbList.length > 0) {
          list = dbList;
        }
      } catch (err) {
        console.warn('[Supabase] Opinions 조회 에러, 로컬로 폴백:', err);
      }
    }

    // 2. 데이터가 비어있거나 Supabase가 불가능하면 로컬 스토리지 확인
    if (list.length === 0) {
      const stored = localStorage.getItem('bangtoron_opinions');
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch {
          // 무시
        }
      }
    }

    // 3. 둘 다 비어있으면 더미 세팅
    if (list.length === 0) {
      list = DUMMY_OPINIONS;
      localStorage.setItem('bangtoron_opinions', JSON.stringify(list));
      
      // DB가 동작 중이면 더미 데이터도 백그라운드 등록 시도
      if (canUseSupabase()) {
        DUMMY_OPINIONS.forEach((op) => {
          dbCreateOpinion(op).catch(() => {});
        });
      }
    }

    setOpinions(list);
    setIsLoading(false);
  };

  useEffect(() => {
    // 닉네임 기본 세팅
    const user = getUser();
    if (user) {
      setName(user.nickname);
    }

    // 좋아요 한 목록 세션 스토리지에서 읽기
    const storedLikes = sessionStorage.getItem('bangtoron_liked_opinions');
    if (storedLikes) {
      try {
        setLikedIds(JSON.parse(storedLikes));
      } catch {
        // 무시
      }
    }

    loadOpinions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newOpinion: Opinion = {
      id: `opinion-${Date.now()}`,
      name: name.trim(),
      content: content.trim(),
      color,
      emoji,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    // 로컬 상태 즉시 업데이트 (낙관적 UI)
    const updated = [newOpinion, ...opinions];
    setOpinions(updated);

    // 1. 로컬 저장
    localStorage.setItem('bangtoron_opinions', JSON.stringify(updated));

    // 2. Supabase 저장 시도
    if (canUseSupabase()) {
      try {
        await dbCreateOpinion(newOpinion);
      } catch (err) {
        console.warn('[Supabase] 의견 업로드 실패:', err);
      }
    }

    // 입력창 비우기
    setContent('');
    
    // 이모지 랜덤 변경
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setEmoji(randomEmoji);

    // 알림창 띄우기
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleLike = async (id: string) => {
    const hasLiked = likedIds.includes(id);
    let nextLikes: string[];

    if (hasLiked) {
      nextLikes = likedIds.filter((item) => item !== id);
    } else {
      nextLikes = [...likedIds, id];
    }

    // 1. 좋아요 기록 세션 스토리지 업데이트
    setLikedIds(nextLikes);
    sessionStorage.setItem('bangtoron_liked_opinions', JSON.stringify(nextLikes));

    // 2. 로컬 의견 리스트 및 로컬 스토리지 업데이트
    const updated = opinions.map((op) =>
      op.id === id ? { ...op, likes: Math.max(0, op.likes + (hasLiked ? -1 : 1)) } : op
    );
    setOpinions(updated);
    localStorage.setItem('bangtoron_opinions', JSON.stringify(updated));

    // 3. Supabase 데이터베이스 동기화
    if (canUseSupabase()) {
      try {
        await dbLikeOpinion(id, !hasLiked);
      } catch (err) {
        console.warn('[Supabase] 좋아요 통신 실패:', err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-xl flex items-center gap-2 animate-fade-in-up">
          <span>📢 의견이 한줄 발언대에 게시되었습니다!</span>
        </div>
      )}

      {/* Header */}
      <section className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-4">
          <MessageSquare size={14} />
          자유 발언대
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          <span className="gradient-text">방구석 자유 발언대</span>
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-lg mx-auto">
          가벼운 의견부터 기발한 발상까지 무엇이든 적어보세요! 
          원하는 색상과 아이콘을 골라 한 줄로 자유롭게 소통합니다. (최대 100자)
        </p>
      </section>

      {/* Editor Block */}
      <section className="glass-card p-6 md:p-8 border border-border/40 animate-fade-in-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">닉네임</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="닉네임 입력"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-hover border border-border text-text-primary placeholder-text-muted text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            {/* Color Select */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-1.5">배경 테마 색상</label>
              <div className="flex gap-2">
                {(['blue', 'orange', 'green', 'purple'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      color === c
                        ? 'border-primary ring-2 ring-primary/20 bg-surface'
                        : 'border-border bg-surface-hover text-text-secondary hover:bg-surface-active'
                    }`}
                  >
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{
                      backgroundColor: c === 'blue' ? '#3182F6' : c === 'orange' ? '#FE6B00' : c === 'green' ? '#00C853' : '#A78BFA'
                    }} />
                    {c === 'blue' ? '블루' : c === 'orange' ? '오렌지' : c === 'green' ? '그린' : '퍼플'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emoji Grid */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1">
              <Smile size={13} />
              대표 이모지 아이콘 선택
            </label>
            <div className="flex flex-wrap gap-2.5 p-3 rounded-xl bg-surface-hover border border-border">
              {EMOJIS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setEmoji(emo)}
                  className={`text-xl p-1.5 rounded-lg transition-transform hover:scale-125 ${
                    emoji === emo 
                      ? 'bg-primary-light border border-primary/30 ring-2 ring-primary/10' 
                      : 'hover:bg-surface'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Content Input & Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={100}
                placeholder="자유롭게 한 줄 남겨주세요 (최대 100자)..."
                className="w-full pl-4 pr-16 py-3.5 rounded-xl bg-surface-hover border border-border text-text-primary placeholder-text-muted text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                {content.length}/100
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-primary py-3.5 px-6 font-bold flex items-center justify-center gap-2 rounded-xl text-sm shrink-0"
            >
              <Send size={14} />
              의견 등록
            </button>
          </div>
        </form>
      </section>

      {/* Opinion Wall Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            📢 현재 발언대 목록
          </h2>
          <span className="text-xs font-bold text-text-secondary bg-surface-hover border border-border px-3 py-1 rounded-full">
            총 {opinions.length}개의 자유 의견
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-text-muted">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-semibold text-sm">실시간 한줄 발언대 불러오는 중...</p>
          </div>
        ) : opinions.length === 0 ? (
          <div className="glass-card text-center py-20 text-text-muted">
            <p className="text-4xl mb-4">💬</p>
            <p className="font-semibold text-lg">첫 번째 한줄 의견의 주인공이 되어보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale-in">
            {opinions.map((op) => {
              const theme = COLOR_MAP[op.color] || COLOR_MAP.blue;
              const hasLiked = likedIds.includes(op.id);

              return (
                <div
                  key={op.id}
                  className={`glass-card p-5 border flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md ${theme.card}`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Emoji & User */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{op.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary">{op.name}</span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(op.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                    </div>
                    {/* Content */}
                    <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap break-words min-h-[40px]">
                      {op.content}
                    </p>
                  </div>

                  {/* Bottom Row: Likes */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/10">
                    <span className="text-[10px] text-text-muted">
                      {new Date(op.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleLike(op.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        hasLiked
                          ? 'bg-rose-500 text-white border-rose-500 shadow-sm scale-105'
                          : 'bg-surface border-border text-text-secondary hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                      }`}
                    >
                      <Heart size={13} className={hasLiked ? 'fill-current animate-pulse' : ''} />
                      <span>{op.likes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
