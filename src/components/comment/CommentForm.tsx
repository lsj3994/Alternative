'use client';

import { useState, useEffect } from 'react';
import { Comment, PollOption } from '@/lib/types';
import { getNickname, saveNickname, saveComment, isLoggedIn, getUser } from '@/lib/store';
import { Send } from 'lucide-react';
import Link from 'next/link';

interface CommentFormProps {
  pollId: string;
  options: PollOption[];
  votedOptionId: string;
  replyToComment?: Comment | null;
  onCancelReply?: () => void;
  onSubmit: (comment: Comment) => void;
}

export default function CommentForm({ pollId, options, votedOptionId, replyToComment, onCancelReply, onSubmit }: CommentFormProps) {
  const user = getUser();
  const [nickname, setNickname] = useState(user?.nickname || getNickname());
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(votedOptionId || options[0]?.id);

  useEffect(() => {
    if (votedOptionId) {
      setSelectedOptionId(votedOptionId);
    }
  }, [votedOptionId]);

  if (!isLoggedIn()) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-text-muted mt-4">
        <p className="mb-3 text-sm font-medium">토론장에 참여하려면 로그인이 필요합니다.</p>
        <Link href="/login" className="btn btn-primary px-6 py-2 text-sm font-bold rounded-xl inline-block">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const selectedOption = options.find((o) => o.id === selectedOptionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !nickname.trim()) return;

    setIsSubmitting(true);
    saveNickname(nickname);

    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      pollId,
      userId: user?.id || 'unknown',
      nickname: nickname.trim(),
      optionId: selectedOptionId,
      optionLabel: selectedOption?.label || '',
      content: content.trim(),
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
      parentId: replyToComment?.id,
    };

    saveComment(comment);
    onSubmit(comment);
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4">
      {replyToComment && (
        <div className="flex items-center justify-between bg-surface/50 p-2 rounded-lg mb-3 border border-border">
          <span className="text-xs text-text-secondary truncate">
            <strong className="text-primary">{replyToComment.nickname}</strong>님에게 답글 작성 중...
          </span>
          <button type="button" onClick={onCancelReply} className="text-xs text-text-muted hover:text-danger">취소</button>
        </div>
      )}
      
      <div className="mb-3">
        <span className="block text-sm text-text-muted mb-2 font-medium">어느 진영으로 의견을 남기시겠어요?</span>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOptionId(option.id)}
              className={`pill ${selectedOptionId === option.id ? 'active' : ''}`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          maxLength={20}
          className="w-32 px-3 py-2 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
          required
        />
      </div>

      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="의견을 남겨보세요..."
          maxLength={500}
          rows={2}
          className="flex-1 px-4 py-3 rounded-xl bg-surface-hover border border-border text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-primary transition-colors"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || !nickname.trim()}
          className="self-end btn btn-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
}
