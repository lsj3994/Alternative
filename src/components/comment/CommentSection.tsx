'use client';

import { useState } from 'react';
import { Comment, PollOption } from '@/lib/types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { MessageSquare, TrendingUp, Clock, Crown } from 'lucide-react';
import { likeCommentSync, dislikeCommentSync } from '@/lib/store';

interface CommentSectionProps {
  pollId: string;
  options: PollOption[];
  initialComments: Comment[];
  votedOptionId: string | null;
}

type SortMode = 'latest' | 'likes' | 'best';

export default function CommentSection({
  pollId,
  options,
  initialComments,
  votedOptionId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [filterOptionId, setFilterOptionId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const handleAddComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
    setReplyTo(null);
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
    likeCommentSync(commentId);
  };

  const handleDislike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
      )
    );
    dislikeCommentSync(commentId);
  };

  // 필터링
  let filtered = filterOptionId
    ? comments.filter((c) => c.optionId === filterOptionId)
    : comments;

  // 부모 댓글만 필터링
  const rootComments = filtered.filter((c) => !c.parentId);
  const childComments = filtered.filter((c) => c.parentId);

  // 정렬 (부모 댓글 기준)
  let sortedRoot = [...rootComments].sort((a, b) => {
    if (sortMode === 'latest')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // descending (newest first)
    if (sortMode === 'likes') return b.likes - a.likes;
    // best: likes - dislikes
    return b.likes - b.dislikes - (a.likes - a.dislikes);
  });

  let visibleRoot = sortedRoot;
  if (sortedRoot.length > visibleCount) {
    visibleRoot = sortedRoot.slice(0, visibleCount);
  }

  const getAlign = (optionId: string) => {
    return options[0]?.id === optionId ? 'left' : 'right';
  };

  return (
    <div className="flex flex-col">
      {/* 댓글 수 표시 */}
      <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
        <span className="font-semibold text-text-primary">{comments.length}개</span>의 의견
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Faction Filter */}
        <button
          onClick={() => setFilterOptionId(null)}
          className={`pill ${!filterOptionId ? 'active' : ''}`}
        >
          전체
        </button>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilterOptionId(opt.id)}
            className={`pill ${filterOptionId === opt.id ? 'active' : ''}`}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Sort */}
        <button
          onClick={() => setSortMode('best')}
          className={`flex items-center gap-1 pill ${sortMode === 'best' ? 'active' : ''}`}
        >
          <Crown size={12} />
          베스트
        </button>
        <button
          onClick={() => setSortMode('likes')}
          className={`flex items-center gap-1 pill ${sortMode === 'likes' ? 'active' : ''}`}
        >
          <TrendingUp size={12} />
          공감순
        </button>
        <button
          onClick={() => setSortMode('latest')}
          className={`flex items-center gap-1 pill ${sortMode === 'latest' ? 'active' : ''}`}
        >
          <Clock size={12} />
          시간순
        </button>
      </div>

      {/* "이전 댓글 더보기" for latest mode */}
      {sortedRoot.length > visibleCount && sortMode === 'latest' && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 20)}
          className="btn w-full mb-4 bg-surface-hover hover:bg-surface-active text-text-primary rounded-2xl py-3 border border-border transition-colors font-medium text-sm"
        >
          이전 대화 더보기 ({sortedRoot.length - visibleCount}개 남음)
        </button>
      )}

      {/* Comments List */}
      <div className="space-y-3 flex flex-col mb-4">
        {visibleRoot.map((comment, i) => {
          const replies = childComments
            .filter((c) => c.parentId === comment.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

          return (
            <div key={comment.id} className="flex flex-col">
              <CommentItem
                comment={comment}
                align={getAlign(comment.optionId)}
                onLike={handleLike}
                onDislike={handleDislike}
                onReply={(c) => setReplyTo(c)}
                index={i}
              />
                {replies.map((reply, j) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    align={getAlign(reply.optionId)}
                    isReply
                    onLike={handleLike}
                    onDislike={handleDislike}
                    index={i + 0.1 * (j + 1)}
                  />
                ))}
                
                {/* Inline Reply Form */}
                {replyTo?.id === comment.id && (
                  <div className="mt-1 mb-4 animate-fade-in pl-4 sm:pl-8 pr-4 sm:pr-8">
                    <CommentForm
                      pollId={pollId}
                      options={options}
                      votedOptionId={votedOptionId || ''}
                      replyToComment={replyTo}
                      onCancelReply={() => setReplyTo(null)}
                      onSubmit={handleAddComment}
                    />
                  </div>
                )}
              </div>
          );
        })}
        {sortedRoot.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-3xl mb-3">💬</p>
            <p>아직 대화가 없습니다. 첫 번째 의견을 남겨보세요!</p>
          </div>
        )}
      </div>

      {/* "더보기" for other modes */}
      {sortedRoot.length > visibleCount && sortMode !== 'latest' && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 20)}
          className="btn w-full mb-4 bg-surface-hover hover:bg-surface-active text-text-primary rounded-2xl py-3 border border-border transition-colors font-medium text-sm"
        >
          더보기 ({sortedRoot.length - visibleCount}개 남음)
        </button>
      )}

      {/* Main Comment Form (At the bottom like a chat app) */}
      {!replyTo && (
        <div className="sticky bottom-4 z-10">
          <CommentForm
            pollId={pollId}
            options={options}
            votedOptionId={votedOptionId || ''}
            onSubmit={handleAddComment}
          />
        </div>
      )}
    </div>
  );
}
