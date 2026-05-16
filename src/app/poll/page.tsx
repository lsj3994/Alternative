'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, BarChart3, Share2 } from 'lucide-react';
import { getPollById, getPollComments, getPollStats, fetchPollById, fetchPollComments, fetchPollStats } from '@/lib/data';
import { getVotedOptions } from '@/lib/store';
import PollDetail from '@/components/poll/PollDetail';
import CommentSection from '@/components/comment/CommentSection';
import GenderPieChart from '@/components/stats/GenderPieChart';
import AgeBarChart from '@/components/stats/AgeBarChart';
import RegionChart from '@/components/stats/RegionChart';
import { Poll, Comment as CommentType, PollStats as PollStatsType } from '@/lib/types';

function PollContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [votedOptionIds, setVotedOptionIds] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [poll, setPoll] = useState<Poll | undefined>(() => id ? getPollById(id) : undefined);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [stats, setStats] = useState<PollStatsType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // 비동기로 DB에서 데이터 로드
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const [dbPoll, dbComments, dbStats] = await Promise.all([
          fetchPollById(id as string),
          fetchPollComments(id as string),
          fetchPollStats(id as string),
        ]);

        if (!cancelled) {
          if (dbPoll) setPoll(dbPoll);
          setComments(dbComments);
          if (dbStats) setStats(dbStats);
        }
      } catch (err) {
        console.warn('투표 데이터 로드 실패:', err);
        // 폴백: 동기 데이터 사용
        if (!cancelled) {
          const localPoll = getPollById(id as string);
          if (localPoll) setPoll(localPoll);
          setComments(getPollComments(id as string));
          setStats(getPollStats(id as string));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (poll) {
      const voted = getVotedOptions(poll.id);
      if (voted.length > 0) {
        setVotedOptionIds(voted);
      }
    }
  }, [poll]);

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😢</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">잘못된 접근입니다</h1>
        <button onClick={() => router.push('/')} className="btn btn-primary mt-4">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (!poll && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">😢</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">투표를 찾을 수 없습니다</h1>
        <p className="text-text-secondary mb-6">삭제되었거나 존재하지 않는 투표입니다.</p>
        <button onClick={() => router.push('/')} className="btn btn-primary">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <p className="text-4xl mb-4">🔄</p>
        <p className="text-lg text-text-muted">투표를 불러오는 중...</p>
      </div>
    );
  }

  const handleVote = (optionIds: string[]) => {
    setVotedOptionIds(optionIds);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        id="back-button"
      >
        <ArrowLeft size={16} />
        목록으로
      </button>

      {/* Thumbnail */}
      {poll.thumbnailUrl && (
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6 animate-fade-in">
          <Image
            src={poll.thumbnailUrl}
            alt={poll.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Poll Detail */}
      <PollDetail
        poll={poll}
        onVote={handleVote}
        onNeedSignup={() => router.push('/signup')}
      />

      {/* Comments (Moved below PollDetail) */}
      <CommentSection
        pollId={poll.id}
        options={poll.options}
        initialComments={comments}
        votedOptionId={votedOptionIds[0] || null}
      />

      {/* Share and Stats toggle buttons */}
      {votedOptionIds.length > 0 && (
        <div className="mt-8 flex gap-2 justify-center">
          <button
            onClick={() => setShowStats((s) => !s)}
            className="btn btn-secondary text-sm px-6"
          >
            <BarChart3 size={16} />
            {showStats ? '통계 숨기기' : '통계 보기'}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: poll.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('링크가 복사되었습니다!');
              }
            }}
            className="btn btn-secondary text-sm px-6"
          >
            <Share2 size={16} />
            공유
          </button>
        </div>
      )}

      {/* Statistics Dashboard */}
      {showStats && stats && (
        <div className="mt-8 space-y-5 animate-fade-in-up">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={22} className="text-primary" />
            통계 대시보드
          </h2>
          <GenderPieChart stats={stats.gender} options={poll.options} />
          <AgeBarChart stats={stats.age} options={poll.options} />
          <RegionChart stats={stats.region} options={poll.options} />
        </div>
      )}
    </div>
  );
}

export default function PollPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <PollContent />
    </Suspense>
  );
}
