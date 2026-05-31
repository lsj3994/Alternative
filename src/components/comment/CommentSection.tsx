'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, PollOption } from '@/lib/types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { MessageSquare, TrendingUp, Clock, Crown, LogIn } from 'lucide-react';
import { likeCommentSync, dislikeCommentSync, isLoggedIn, getCurrentUserId, getMyCommentVote } from '@/lib/store';
import { fetchPollComments } from '@/lib/data';

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
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // DB에서 직접 댓글 로드
  const refreshComments = useCallback(async () => {
    try {
      const fresh = await fetchPollComments(pollId);
      setComments(fresh);
    } catch (err) {
      console.warn('댓글 로드 실패:', err);
    }
  }, [pollId]);

  // 마운트 시 DB에서 최신 댓글 로드 (캐시 무시)
  useEffect(() => {
    refreshComments();
  }, [refreshComments]);

  const handleAddComment = (comment: Comment) => {
    // 낙관적 업데이트: 즉시 UI에 표시
    setComments((prev) => {
      // 중복 방지
      if (prev.some((c) => c.id === comment.id)) return prev;
      return [comment, ...prev];
    });
    setReplyTo(null);

    // DB 저장 완료 후 재조회하여 완전 동기화
    setTimeout(() => {
      refreshComments();
    }, 2000);
  };

  const handleLike = (commentId: string) => {
    if (!isLoggedIn()) {
      showToast('로그인 후 추천할 수 있어요 😊');
      return;
    }
    const userId = getCurrentUserId();
    const existing = getMyCommentVote(commentId, userId);
    if (existing) {
      showToast('이미 의견을 남겼어요!');
      return;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
    likeCommentSync(commentId, userId);
  };

  const handleDislike = (commentId: string) => {
    if (!isLoggedIn()) {
      showToast('로그인 후 비추천할 수 있어요 😐');
      return;
    }
    const userId = getCurrentUserId();
    const existing = getMyCommentVote(commentId, userId);
    if (existing) {
      showToast('이미 의견을 남겼어요!');
      return;
    }
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c
      )
    );
    dislikeCommentSync(commentId, userId);
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

  const currentUserId = isLoggedIn() ? getCurrentUserId() : null;

  return (
    <div className="flex flex-col">
      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
          <LogIn size={14} />
          {toast}
        </div>
      )}

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
                myVote={currentUserId ? getMyCommentVote(comment.id, currentUserId) : null}
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
                    myVote={currentUserId ? getMyCommentVote(reply.id, currentUserId) : null}
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
