'use client';

import { useState } from 'react';
import { Comment, PollOption } from '@/lib/types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { MessageSquare, TrendingUp, Clock, Crown } from 'lucide-react';

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

  const handleAddComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleDislike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
      )
    );
  };

  // 필터링
  let filtered = filterOptionId
    ? comments.filter((c) => c.optionId === filterOptionId)
    : comments;

  // 정렬
  filtered = [...filtered].sort((a, b) => {
    if (sortMode === 'latest')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === 'likes') return b.likes - a.likes;
    // best: likes - dislikes
    return b.likes - b.dislikes - (a.likes - a.dislikes);
  });

  return (
    <div className="mt-10">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={22} className="text-primary" />
        <h2 className="text-xl font-bold text-text-primary">
          토론장 <span className="text-text-muted text-base font-normal">({comments.length})</span>
        </h2>
      </div>

      {/* Comment Form */}
      {votedOptionId && (
        <CommentForm
          pollId={pollId}
          options={options}
          votedOptionId={votedOptionId}
          onSubmit={handleAddComment}
        />
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-4 mt-6">
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
          최신순
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filtered.map((comment, i) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={handleLike}
            onDislike={handleDislike}
            index={i}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p className="text-3xl mb-3">💬</p>
          <p>아직 댓글이 없습니다. 첫 번째 의견을 남겨보세요!</p>
        </div>
      )}
    </div>
  );
}
