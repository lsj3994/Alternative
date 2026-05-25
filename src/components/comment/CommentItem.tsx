'use client';

import { Comment } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { ThumbsUp, ThumbsDown, Crown } from 'lucide-react';

import { getCurrentUserId } from '@/lib/store';

interface CommentItemProps {
  comment: Comment;
  align?: 'left' | 'right';
  isReply?: boolean;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onReply?: (comment: Comment) => void;
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

export default function CommentItem({ comment, align = 'left', isReply = false, onLike, onDislike, onReply, index = 0 }: CommentItemProps) {
  const netScore = comment.likes - comment.dislikes;
  const currentUserId = getCurrentUserId();
  const isMine = comment.userId === currentUserId;
  const isRight = align === 'right';

  return (
    <div
      className={`flex w-full mb-4 animate-fade-in ${isRight ? 'justify-end' : 'justify-start'} ${isReply ? 'pl-8 sm:pl-12' : ''}`}
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
        
        {/* Name and badge */}
        <div className={`flex items-center gap-2 mb-1 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className={`font-bold text-xs ${isMine ? 'text-primary' : 'text-text-muted'}`}>{comment.nickname}</span>
          <Badge label={comment.optionLabel} />
        </div>

        {/* Bubble */}
        <div 
          className={`relative px-4 py-3 shadow-sm ${
            isRight 
              ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
              : 'bg-surface border border-border text-text-primary rounded-2xl rounded-tl-sm'
          } ${comment.isBest ? 'ring-2 ring-accent/50' : ''}`}
        >
          {comment.isBest && (
            <div className={`flex items-center gap-1 text-[10px] font-bold mb-1 ${isRight ? 'text-white/80' : 'text-accent'}`}>
              <Crown size={12} />
              베스트 댓글
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        </div>

        {/* Footer */}
        <div className={`flex items-center gap-3 mt-1.5 px-1 text-[11px] text-text-muted ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{timeAgo(comment.createdAt)}</span>
          
          <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1 hover:text-primary transition-colors group"
            >
              <ThumbsUp size={12} className="group-hover:animate-bounce-sm" />
              <span>{comment.likes}</span>
            </button>
            <button
              onClick={() => onDislike(comment.id)}
              className="flex items-center gap-1 hover:text-danger transition-colors"
            >
              <ThumbsDown size={12} />
              <span>{comment.dislikes}</span>
            </button>
            <span className={`font-semibold ${netScore > 0 ? 'text-primary' : netScore < 0 ? 'text-danger' : ''}`}>
              {netScore > 0 ? '+' : ''}{netScore !== 0 ? netScore : ''}
            </span>
          </div>

          {!isReply && onReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-text-muted hover:text-primary transition-colors font-medium"
            >
              답글 달기
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
