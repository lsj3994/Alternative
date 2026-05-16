'use client';

import { Comment } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { ThumbsUp, ThumbsDown, Crown } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  index?: number;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function CommentItem({ comment, onLike, onDislike, index = 0 }: CommentItemProps) {
  const netScore = comment.likes - comment.dislikes;

  return (
    <div
      className={`glass-card rounded-xl p-4 animate-fade-in ${
        comment.isBest ? 'ring-1 ring-accent/30' : ''
      }`}
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
    >
      {/* Best Badge */}
      {comment.isBest && (
        <div className="flex items-center gap-1 text-xs font-semibold text-accent mb-2">
          <Crown size={13} />
          베스트 댓글
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-sm text-text-primary">{comment.nickname}</span>
        <Badge label={comment.optionLabel} />
        <span className="text-xs text-text-muted ml-auto">{timeAgo(comment.createdAt)}</span>
      </div>

      {/* Content */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3">
        {comment.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <button
          onClick={() => onLike(comment.id)}
          className="flex items-center gap-1 hover:text-primary transition-colors group"
        >
          <ThumbsUp size={14} className="group-hover:animate-bounce-sm" />
          <span>{comment.likes}</span>
        </button>
        <button
          onClick={() => onDislike(comment.id)}
          className="flex items-center gap-1 hover:text-danger transition-colors"
        >
          <ThumbsDown size={14} />
          <span>{comment.dislikes}</span>
        </button>
        <span className={`ml-auto font-semibold ${netScore > 0 ? 'text-primary' : netScore < 0 ? 'text-danger' : ''}`}>
          {netScore > 0 ? '+' : ''}{netScore}
        </span>
      </div>
    </div>
  );
}
