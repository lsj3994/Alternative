'use client';

import { useState } from 'react';
import { Comment, PollOption } from '@/lib/types';
import { getNickname, saveNickname, saveComment } from '@/lib/store';
import { Send } from 'lucide-react';

interface CommentFormProps {
  pollId: string;
  options: PollOption[];
  votedOptionId: string;
  onSubmit: (comment: Comment) => void;
}

export default function CommentForm({ pollId, options, votedOptionId, onSubmit }: CommentFormProps) {
  const [nickname, setNickname] = useState(getNickname());
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const votedOption = options.find((o) => o.id === votedOptionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !nickname.trim()) return;

    setIsSubmitting(true);
    saveNickname(nickname);

    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      pollId,
      userId: 'local-user',
      nickname: nickname.trim(),
      optionId: votedOptionId,
      optionLabel: votedOption?.label || '',
      content: content.trim(),
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
    };

    saveComment(comment);
    onSubmit(comment);
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-text-muted">
          {votedOption?.emoji} <strong>{votedOption?.label}</strong> 진영으로 댓글 작성
        </span>
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
