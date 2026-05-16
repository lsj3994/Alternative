'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Poll, PollOption } from '@/lib/types';
import { hasVoted, saveVote, getDemographics, isLoggedIn, getUser } from '@/lib/store';
import VoteResultBar from './VoteResultBar';
import { CheckCircle2 } from 'lucide-react';

interface PollDetailProps {
  poll: Poll;
  onVote: (optionId: string) => void;
  onNeedSignup: () => void;
}

export default function PollDetail({ poll, onVote, onNeedSignup }: PollDetailProps) {
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const voted = hasVoted(poll.id);
    if (voted) {
      setVotedOptionId(voted);
      setShowResults(true);
    }
  }, [poll.id]);

  const handleVote = (option: PollOption) => {
    if (votedOptionId) return;

    // 회원가입 체크
    if (!isLoggedIn()) {
      onNeedSignup();
      return;
    }

    const demographics = getDemographics();
    const user = getUser();

    setIsAnimating(true);
    setVotedOptionId(option.id);

    // 투표 저장
    saveVote({
      id: `vote-${Date.now()}`,
      pollId: poll.id,
      optionId: option.id,
      userId: user?.id || 'local-user',
      gender: demographics?.gender,
      ageGroup: demographics?.ageGroup,
      region: demographics?.region,
      createdAt: new Date().toISOString(),
    });

    onVote(option.id);

    // 결과 표시 애니메이션
    setTimeout(() => {
      setShowResults(true);
      setIsAnimating(false);
    }, 300);
  };

  const updatedOptions = poll.options.map((opt) => ({
    ...opt,
    voteCount: opt.id === votedOptionId ? opt.voteCount + 1 : opt.voteCount,
  }));

  const totalVotes = votedOptionId ? poll.totalVotes + 1 : poll.totalVotes;
  const maxVotes = Math.max(...updatedOptions.map((o) => o.voteCount));

  return (
    <div className="animate-fade-in">
      {/* 투표 제목 & 설명 */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2">
          {poll.title}
        </h1>
        {poll.description && (
          <p className="text-text-secondary text-base md:text-lg">
            {poll.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-sm text-text-muted">
          <span className={`badge ${poll.status === 'active' ? 'badge-live' : 'badge-closed'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${poll.status === 'active' ? 'bg-success animate-pulse-soft' : 'bg-danger'}`} />
            {poll.status === 'active' ? '진행중' : '종료'}
          </span>
          <span>총 {totalVotes.toLocaleString()}명 참여</span>
        </div>
      </div>

      {/* 선택지 목록 */}
      <div className="space-y-4">
        {updatedOptions.map((option) => {
          const percent = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
          const isWinner = option.voteCount === maxVotes && showResults;
          const isSelected = votedOptionId === option.id;

          return (
            <div key={option.id} className="animate-fade-in-up">
              {!showResults ? (
                /* ---- 투표 전: 선택 버튼 ---- */
                <button
                  onClick={() => handleVote(option)}
                  disabled={!!votedOptionId}
                  className={`w-full group glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] ${
                    isAnimating && isSelected
                      ? 'border-primary scale-[0.98] opacity-80'
                      : ''
                  }`}
                  id={`vote-btn-${option.id}`}
                >
                  {option.imageUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={option.imageUrl}
                        alt={option.label}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-1">
                    {option.emoji && (
                      <span className="text-2xl group-hover:animate-bounce-sm">
                        {option.emoji}
                      </span>
                    )}
                    <span className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </div>
                  <span className="text-text-muted text-sm group-hover:text-primary transition-colors">
                    투표하기 →
                  </span>
                </button>
              ) : (
                /* ---- 투표 후: 결과 표시 ---- */
                <div
                  className={`glass-card rounded-2xl p-4 transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                    <span className="font-bold text-text-primary flex-1">
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={20} className="text-primary animate-scale-in" />
                    )}
                    <span
                      className={`text-lg font-extrabold ${
                        isWinner ? 'gradient-text' : 'text-text-secondary'
                      }`}
                    >
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <VoteResultBar
                    percent={percent}
                    isWinner={isWinner}
                    animate={true}
                  />
                  <div className="mt-1 text-xs text-text-muted text-right">
                    {option.voteCount.toLocaleString()}표
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
