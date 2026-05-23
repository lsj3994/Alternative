'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Poll, PollOption } from '@/lib/types';
import {
  getVotedOptions,
  saveVote,
  getDemographics,
  isLoggedIn,
  getUser,
  canVoteMore,
  getMaxVotes,
  cancelVote,
} from '@/lib/store';
import VoteResultBar from './VoteResultBar';
import { CheckCircle2, Vote } from 'lucide-react';

interface PollDetailProps {
  poll: Poll;
  onVote: (optionIds: string[]) => void;
  onNeedSignup: () => void;
}

export default function PollDetail({ poll, onVote, onNeedSignup }: PollDetailProps) {
  const [votedOptionIds, setVotedOptionIds] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [justVotedIds, setJustVotedIds] = useState<string[]>([]);

  useEffect(() => {
    const voted = getVotedOptions(poll.id);
    if (voted.length > 0) {
      setVotedOptionIds(voted);
      setShowResults(true);
    }
  }, [poll.id]);

  const handleCancelVote = () => {
    if (confirm('투표를 취소하고 다시 선택하시겠습니까?')) {
      cancelVote(poll.id);
      setVotedOptionIds([]);
      setJustVotedIds([]);
      setShowResults(false);
      onVote([]); // 부모 컴포넌트에 투표 상태 초기화 전달
    }
  };

  const handleVote = (option: PollOption) => {
    if (votedOptionIds.length >= getMaxVotes()) return;

    const newVotedIds = [...votedOptionIds, option.id];
    setVotedOptionIds(newVotedIds);

    // 즉시 투표 저장
    const demographics = getDemographics();
    const user = getUser();
    const userId = user?.id || 'local-user';
    const newVoteId = `vote-${Date.now()}-${option.id}-${votedOptionIds.length}`;

    saveVote({
      id: newVoteId,
      pollId: poll.id,
      optionId: option.id,
      userId,
      gender: demographics?.gender,
      ageGroup: demographics?.ageGroup,
      region: demographics?.region,
      createdAt: new Date().toISOString(),
    });

    setJustVotedIds((jPrev) => [...jPrev, option.id]); // 낙관적 업데이트용
    onVote(newVotedIds, option.id);

    // 투표를 모두 소진하면 결과 표시
    if (newVotedIds.length >= getMaxVotes()) {
      setIsAnimating(true);
      setTimeout(() => {
        setShowResults(true);
        setIsAnimating(false);
      }, 300);
    }
  };

  const userVoteCount = justVotedIds.length;

  const updatedOptions = poll.options.map((opt) => ({
    ...opt,
    voteCount: opt.voteCount + justVotedIds.filter((id) => id === opt.id).length,
  }));

  const totalVotes = poll.totalVotes + userVoteCount;
  const maxVotes = Math.max(...updatedOptions.map((o) => o.voteCount));
  const remainingVotes = getMaxVotes() - votedOptionIds.length;

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

      {/* 투표 안내 - 아직 투표 전일 때만 표시 */}
      {!showResults && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vote size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">
                최대 {getMaxVotes()}개까지 선택 가능
              </span>
            </div>
            <span className={`text-sm font-bold ${remainingVotes === 0 ? 'text-danger' : 'text-primary'}`}>
              {votedOptionIds.length > 0
                ? `${votedOptionIds.length}개 선택됨 · 남은 표: ${remainingVotes}`
                : `${getMaxVotes()}표 사용 가능`}
            </span>
          </div>
        </div>
      )}

      {/* 선택지 목록 */}
      <div className="space-y-4">
        {updatedOptions.map((option) => {
          const percent = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
          const isWinner = option.voteCount === maxVotes && showResults;
          const myVotesForOption = votedOptionIds.filter((id) => id === option.id).length;
          const isSelected = myVotesForOption > 0;
          const isDisabled = !isSelected && remainingVotes === 0;

          return (
            <div key={option.id} className="animate-fade-in-up">
              {!showResults ? (
                /* ---- 투표 전: 선택 버튼 ---- */
                <button
                  onClick={() => handleVote(option)}
                  disabled={isDisabled}
                  className={`w-full group glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-primary hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
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
                    <span className={`text-lg font-bold transition-colors ${
                      isSelected ? 'text-primary' : 'text-text-primary group-hover:text-primary'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  {/* 클릭시 바로 투표 적용 안내 */}
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 size={20} className="text-primary animate-scale-in" />
                      <span className="text-primary font-bold text-sm bg-primary/10 px-2.5 py-0.5 rounded-full">
                        ({myVotesForOption}/{getMaxVotes()})
                      </span>
                    </div>
                  ) : (
                    <span className="text-text-muted text-sm group-hover:text-primary transition-colors shrink-0">
                      투표하기 →
                    </span>
                  )}
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

      {/* 투표 중간 결과 보기 버튼 (남은 표가 있을 때) */}
      {!showResults && votedOptionIds.length > 0 && votedOptionIds.length < getMaxVotes() && (
        <div className="mt-6 animate-fade-in-up flex flex-col items-center">
          <p className="text-center text-sm font-medium mb-3 text-primary/90">
            투표를 일찍 종료하고 결과를 볼 수 있습니다
          </p>
          <button
            onClick={() => setShowResults(true)}
            className="w-full max-w-xs btn bg-surface-hover text-text-primary border border-border text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-surface-active"
          >
            결과 보기 (투표 종료)
          </button>
        </div>
      )}

      {/* 전체 투표수 요약 바 (선택지1 vs 선택지2 ...) */}
      <div className="mt-8 glass-card rounded-2xl p-5 animate-fade-in">
        <div className="text-sm font-bold text-text-secondary mb-3 flex items-center justify-between">
          <span>📊 전체 투표 현황 요약</span>
          <span className="text-xs font-normal text-text-muted">총 {totalVotes.toLocaleString()}표</span>
        </div>

        {/* VS 텍스트 요약 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-sm font-extrabold text-text-primary">
          {updatedOptions.map((opt, i) => (
            <span key={opt.id} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-text-muted font-normal mx-1">vs</span>}
              <span className="truncate max-w-[120px]">{opt.label}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-hover text-primary border border-border">
                {opt.voteCount.toLocaleString()}표
              </span>
            </span>
          ))}
        </div>

        {/* 통합 퍼센트 바 (그래프) */}
        {totalVotes > 0 ? (
          <div className="w-full h-8 bg-surface-hover rounded-xl overflow-hidden flex shadow-inner border border-border/50">
            {updatedOptions.map((opt, i) => {
              const pct = (opt.voteCount / totalVotes) * 100;
              if (pct === 0) return null;
              // 색상 팔레트 (옵션별 다르게)
              const bgColors = [
                'bg-primary',
                'bg-blue-500',
                'bg-purple-500',
                'bg-amber-500',
                'bg-emerald-500',
              ];
              const bgColor = bgColors[i % bgColors.length];

              return (
                <div
                  key={opt.id}
                  style={{ width: `${pct}%` }}
                  className={`${bgColor} h-full flex items-center justify-center text-xs font-bold text-white px-1 transition-all duration-500 overflow-hidden first:rounded-l-xl last:rounded-r-xl border-r last:border-r-0 border-black/10`}
                  title={`${opt.label}: ${pct.toFixed(1)}%`}
                >
                  {pct >= 8 ? `${pct.toFixed(0)}%` : ''}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-8 bg-surface-hover rounded-xl flex items-center justify-center text-xs text-text-muted">
            아직 투표가 없습니다
          </div>
        )}
      </div>

      {/* 결과 화면 - 투표 취소 버튼 (핑크색) */}
      {showResults && (
        <div className="mt-8 flex justify-center animate-fade-in">
          <button
            onClick={handleCancelVote}
            className="w-full max-w-xs btn bg-pink-500 hover:bg-pink-600 text-white text-base py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            투표 다시 하기 (취소)
          </button>
        </div>
      )}
    </div>
  );
}
