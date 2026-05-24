'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Users, Clock, TrendingUp } from 'lucide-react';
import { Poll } from '@/lib/types';

interface PollCardProps {
  poll: Poll;
  index?: number;
}

function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}천`;
  return num.toString();
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

export default function PollCard({ poll, index = 0 }: PollCardProps) {
  const isAdminDeleted = poll.description?.startsWith('[ADMIN_DELETED]:');
  const adminComment = isAdminDeleted ? poll.description?.substring('[ADMIN_DELETED]:'.length) : '';

  const leadingOption = !isAdminDeleted && poll.options && poll.options.length > 0
    ? poll.options.reduce((a, b) => (a.voteCount > b.voteCount ? a : b))
    : null;
  const leadPercent =
    !isAdminDeleted && poll.totalVotes > 0 && leadingOption
      ? Math.round((leadingOption.voteCount / poll.totalVotes) * 100)
      : 0;

  return (
    <Link
      href={`/poll?id=${poll.id}`}
      className={`group block glass-card rounded-2xl overflow-hidden hover-lift hover-glow animate-fade-in-up ${
        isAdminDeleted ? 'opacity-80 border-danger/30 bg-danger/5' : ''
      }`}
      style={{ animationDelay: `${index * 0.07}s`, animationFillMode: 'both' }}
      id={`poll-card-${poll.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={poll.thumbnailUrl || 'https://picsum.photos/seed/default/800/600'}
          alt={poll.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`badge ${
              isAdminDeleted ? 'bg-danger text-white' : poll.status === 'active' ? 'badge-live' : 'badge-closed'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAdminDeleted ? 'bg-white' : poll.status === 'active' ? 'bg-success animate-pulse-soft' : 'bg-danger'
              }`}
            />
            {isAdminDeleted ? '삭제됨' : poll.status === 'active' ? '진행중' : '종료'}
          </span>
        </div>

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/20 text-white backdrop-blur-sm text-xs">
            {poll.category}
          </span>
        </div>

        {/* Leading Info */}
        {leadingOption && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <TrendingUp size={12} />
              <span>
                {leadingOption.emoji || ''} {leadingOption.label} 우세 ({leadPercent}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
          {poll.title}
        </h3>
        {poll.description && (
          <p className="mt-1 text-sm text-text-secondary line-clamp-2">
            {isAdminDeleted ? `🚫 관리자 삭제 사유: ${adminComment}` : poll.description}
          </p>
        )}

        {/* Options Preview */}
        {!isAdminDeleted ? (
          <div className="mt-3 flex gap-2">
            {poll.options.map((opt) => (
              <span
                key={opt.id}
                className="flex-1 text-center py-1.5 px-2 rounded-lg bg-surface-hover text-xs font-medium text-text-secondary truncate"
              >
                {opt.emoji} {opt.label}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-danger/10 text-xs font-semibold text-danger truncate">
            관리자에 의해 삭제 조치된 투표입니다.
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{formatNumber(poll.totalVotes)}명 참여</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{timeAgo(poll.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
