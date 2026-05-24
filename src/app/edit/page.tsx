'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Sparkles, Upload, ImageIcon } from 'lucide-react';
import { generateAIImage } from '@/lib/ai-image';
import { CATEGORIES, fetchPollById, updatePoll } from '@/lib/data';
import { getUser, isLoggedIn } from '@/lib/store';
import Spinner from '@/components/ui/Spinner';
import { Poll } from '@/lib/types';

interface OptionInput {
  id: string;
  label: string;
  imageUrl: string;
}

function EditPollContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [poll, setPoll] = useState<Poll | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isGeneratingOption, setIsGeneratingOption] = useState<string | null>(null);

  // 로그인 체크 및 기존 데이터 로드
  useEffect(() => {
    if (!isLoggedIn()) {
      alert('회원만 투표를 수정할 수 있습니다.');
      router.push('/signup');
      return;
    }

    if (!id) {
      alert('잘못된 접근입니다.');
      router.push('/');
      return;
    }

    async function loadPoll() {
      setIsLoading(true);
      const existing = await fetchPollById(id as string);
      if (!existing) {
        alert('존재하지 않는 투표입니다.');
        router.push('/');
        return;
      }

      const currentUser = getUser();
      const isAdmin = currentUser?.loginId === 'admin';
      if (existing.createdBy !== currentUser?.id && !isAdmin) {
        alert('본인이 개설한 투표만 수정할 수 있습니다.');
        router.push(`/poll?id=${existing.id}`);
        return;
      }

      setPoll(existing);
      setTitle(existing.title);
      setDescription(existing.description || '');
      setCategory(existing.category);
      setOptions(
        existing.options.map((o) => ({
          id: o.id,
          label: o.label,
          imageUrl: o.imageUrl || '',
        }))
      );
      setIsLoading(false);
    }

    loadPoll();
  }, [id, router]);

  // 옵션 추가
  const addOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, { id: `new-${Date.now()}`, label: '', imageUrl: '' }]);
  };

  // 옵션 삭제
  const removeOption = (optId: string) => {
    if (options.length <= 2) return;
    if (confirm('선택지를 삭제하면 해당 선택지에 투표한 기존 기록도 함께 삭제됩니다. 계속하시겠습니까?')) {
      setOptions(options.filter((o) => o.id !== optId));
    }
  };

  // 옵션 수정
  const updateOption = (optId: string, field: 'label' | 'imageUrl', value: string) => {
    setOptions(options.map((o) => (o.id === optId ? { ...o, [field]: value } : o)));
  };

  // 개별 옵션 이미지 AI 생성
  const generateOptionImage = async (optionId: string, label: string) => {
    if (!label.trim()) {
      alert('선택지 이름을 먼저 입력해주세요!');
      return;
    }
    setIsGeneratingOption(optionId);
    try {
      const prompt = title.trim()
        ? `${title} 투표에서 "${label}" 항목을 대표하는 이미지`
        : `"${label}"을(를) 표현하는 이미지`;
      const url = await generateAIImage(prompt, label.trim());
      updateOption(optionId, 'imageUrl', url);
    } catch {
      alert('이미지 생성에 실패했습니다.');
    }
    setIsGeneratingOption(null);
  };

  // 전체 선택지 AI 이미지 일괄 생성
  const generateAllImages = async () => {
    const filledOptions = options.filter((o) => o.label.trim());
    if (filledOptions.length < 2) {
      alert('최소 2개의 선택지 이름을 먼저 입력해주세요!');
      return;
    }

    setIsGeneratingAll(true);
    try {
      const results = await Promise.all(
        filledOptions.map(async (opt) => {
          const prompt = title.trim()
            ? `${title} 투표에서 "${opt.label}" 항목을 대표하는 이미지`
            : `"${opt.label}"을(를) 표현하는 이미지`;
          const url = await generateAIImage(prompt, opt.label.trim());
          return { id: opt.id, url };
        })
      );

      setOptions((prev) =>
        prev.map((o) => {
          const result = results.find((r) => r.id === o.id);
          return result ? { ...o, imageUrl: result.url } : o;
        })
      );
    } catch {
      alert('이미지 생성 중 오류가 발생했습니다.');
    }
    setIsGeneratingAll(false);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, optionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하만 가능합니다.');
      return;
    }
    
    try {
      const { compressImage } = await import('@/lib/imageUtils');
      const compressedUrl = await compressImage(file, 800, 800, 0.7);
      updateOption(optionId, 'imageUrl', compressedUrl);
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;

    if (!title.trim() || options.filter((o) => o.label.trim()).length < 2) {
      alert('제목과 최소 2개의 선택지를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const validOptions = options.filter((o) => o.label.trim());
    const thumbnailUrl = validOptions.find((o) => o.imageUrl)?.imageUrl || undefined;

    const res = await updatePoll(
      poll.id,
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || '기타',
        thumbnailUrl,
      },
      validOptions.map((opt) => ({
        id: opt.id.startsWith('new-') ? `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : opt.id,
        label: opt.label.trim(),
        imageUrl: opt.imageUrl || undefined,
      }))
    );

    setIsSubmitting(false);

    if (res.success) {
      alert('🎉 투표 내용이 성공적으로 수정되었습니다!');
      router.push(`/poll?id=${poll.id}`);
    } else {
      alert(`수정 실패: ${res.error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
        <p className="text-4xl mb-4">🔄</p>
        <p className="text-lg text-text-muted">기존 투표 정보를 불러오는 중...</p>
      </div>
    );
  }

  const isValid = title.trim() && options.filter((o) => o.label.trim()).length >= 2;
  const filledOptions = options.filter((o) => o.label.trim());
  const optionsWithImages = filledOptions.filter((o) => o.imageUrl);
  const hasAllImages = filledOptions.length >= 2 && optionsWithImages.length === filledOptions.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => router.push(`/poll?id=${poll?.id}`)}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        투표 상세로 돌아가기
      </button>

      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">
          ✏️ 투표 내용 수정
        </h1>
        <p className="text-text-secondary">
          제목, 설명, 카테고리 및 선택지를 수정할 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            투표 제목 *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 짜장면 vs 짬뽕"
            maxLength={100}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-border text-text-primary placeholder-text-muted text-lg font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="투표에 대한 간단한 설명을 적어보세요..."
            maxLength={300}
            rows={2}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-border text-text-primary placeholder-text-muted text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            카테고리 *
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c !== '전체').map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`pill ${category === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 선택지 + 이미지 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-text-primary">
              선택지 설정 (2~5개) *
            </label>
            <button
              type="button"
              onClick={generateAllImages}
              disabled={isGeneratingAll || hasAllImages || filledOptions.length < 2}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles size={14} className={isGeneratingAll ? 'animate-spin' : ''} />
              {isGeneratingAll ? 'AI 생성 중...' : '전체 AI 이미지 생성'}
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 group">
                <span className="w-6 text-center font-bold text-text-muted">
                  {index + 1}
                </span>
                <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-2xl p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                    placeholder={`선택지 ${index + 1} 입력`}
                    maxLength={30}
                    className="flex-1 bg-transparent px-2 py-1 text-text-primary placeholder-text-muted focus:outline-none font-medium"
                    required
                  />

                  {/* 이미지 썸네일 미리보기 */}
                  {option.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border group/img">
                      <img src={option.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateOption(option.id, 'imageUrl', '')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="이미지 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => generateOptionImage(option.id, option.label)}
                        disabled={isGeneratingOption === option.id || !option.label.trim()}
                        className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="AI 이미지 생성"
                      >
                        <Sparkles size={18} className={isGeneratingOption === option.id ? 'animate-spin text-primary' : ''} />
                      </button>

                      <label className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 cursor-pointer transition-all" title="직접 업로드">
                        <Upload size={18} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, option.id)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= 2}
                  className="p-3 rounded-2xl text-text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* 옵션 추가 버튼 */}
          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="w-full py-3 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-semibold"
            >
              <Plus size={18} />
              선택지 추가 ({options.length}/5)
            </button>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full btn btn-primary py-4 text-lg rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Spinner size={18} /> : '수정 완료'}
        </button>
      </form>
    </div>
  );
}

export default function EditPollPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <EditPollContent />
    </Suspense>
  );
}
