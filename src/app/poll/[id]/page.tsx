'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, BarChart3, Share2 } from 'lucide-react';
import { getPollById, getPollComments, getPollStats } from '@/lib/data';
import { hasVoted } from '@/lib/store';
import PollDetail from '@/components/poll/PollDetail';
import CommentSection from '@/components/comment/CommentSection';
import GenderPieChart from '@/components/stats/GenderPieChart';
import AgeBarChart from '@/components/stats/AgeBarChart';
import RegionChart from '@/components/stats/RegionChart';

export default function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const poll = getPollById(id);
  const comments = poll ? getPollComments(poll.id) : [];
  const stats = poll ? getPollStats(poll.id) : undefined;

  useEffect(() => {
    if (poll) {
      const voted = hasVoted(poll.id);
      if (voted) {
        setVotedOptionId(voted);
        setShowStats(true);
      }
    }
  }, [poll]);

  if (!poll) {
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

  const handleVote = (optionId: string) => {
    setVotedOptionId(optionId);
    setShowStats(true);
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

      {/* Poll Detail — 비회원이면 /signup으로 리디렉션 */}
      <PollDetail
        poll={poll}
        onVote={handleVote}
        onNeedSignup={() => router.push('/signup')}
      />

      {/* Share button */}
      {votedOptionId && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowStats((s) => !s)}
            className="btn btn-secondary text-sm"
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
            className="btn btn-secondary text-sm"
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

      {/* Comments */}
      <CommentSection
        pollId={poll.id}
        options={poll.options}
        initialComments={comments}
        votedOptionId={votedOptionId}
      />
    </div>
  );
}
