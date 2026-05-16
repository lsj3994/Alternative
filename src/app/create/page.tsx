'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2, Sparkles, Upload, Eye, ImageIcon } from 'lucide-react';
import { generateAIImage } from '@/lib/ai-image';
import { CATEGORIES } from '@/lib/data';
import Spinner from '@/components/ui/Spinner';

interface OptionInput {
  id: string;
  label: string;
  imageUrl: string;
}

export default function CreatePollPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { id: 'new-1', label: '', imageUrl: '' },
    { id: 'new-2', label: '', imageUrl: '' },
  ]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isGeneratingOption, setIsGeneratingOption] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 옵션 추가
  const addOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, { id: `new-${Date.now()}`, label: '', imageUrl: '' }]);
  };

  // 옵션 삭제
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  // 옵션 수정
  const updateOption = (id: string, field: 'label' | 'imageUrl', value: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
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
      const url = await generateAIImage(prompt);
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
          const url = await generateAIImage(prompt);
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
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, optionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 가능합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateOption(optionId, 'imageUrl', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || options.filter((o) => o.label.trim()).length < 2) {
      alert('제목과 최소 2개의 선택지를 입력해주세요.');
      return;
    }
    alert('🎉 투표가 개설되었습니다! (현재는 데모 모드)');
    router.push('/');
  };

  const isValid = title.trim() && options.filter((o) => o.label.trim()).length >= 2;
  const filledOptions = options.filter((o) => o.label.trim());
  const optionsWithImages = filledOptions.filter((o) => o.imageUrl);
  const hasAllImages = filledOptions.length >= 2 && optionsWithImages.length === filledOptions.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        목록으로
      </button>

      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">
          🗳️ 새 투표 개설
        </h1>
        <p className="text-text-secondary">
          논쟁거리를 던져보세요! AI가 선택지에 맞는 이미지를 만들어 드립니다.
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
            id="poll-title-input"
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
            <label className="block text-sm font-semibold text-text-primary">
              선택지 * (최소 2개, 최대 5개)
            </label>
          </div>

          <div className="space-y-3">
            {options.map((option, idx) => (
              <div key={option.id} className="glass-card rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                    placeholder={`선택지 ${String.fromCharCode(65 + idx)} (예: ${idx === 0 ? '짜장면' : '짬뽕'})`}
                    maxLength={50}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-surface-hover border border-border text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required={idx < 2}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* 옵션 이미지 영역 */}
                {option.imageUrl ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <Image
                      src={option.imageUrl}
                      alt={option.label || '선택지 이미지'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 text-xs font-bold text-gray-800">
                        {String.fromCharCode(65 + idx)}. {option.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateOption(option.id, 'imageUrl', '')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-hover text-xs text-text-muted cursor-pointer hover:text-primary hover:bg-primary-light transition-all">
                      <Upload size={13} />
                      직접 업로드
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, option.id)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => generateOptionImage(option.id, option.label)}
                      disabled={isGeneratingOption === option.id || isGeneratingAll}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      {isGeneratingOption === option.id ? (
                        <>
                          <Spinner size={13} />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          AI 이미지 생성
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={16} />
              선택지 추가
            </button>
          )}

          {/* ✨ AI 이미지 일괄 생성 버튼 */}
          {filledOptions.length >= 2 && !hasAllImages && (
            <button
              type="button"
              onClick={generateAllImages}
              disabled={isGeneratingAll}
              className="w-full mt-4 btn btn-primary py-3.5 text-base rounded-2xl disabled:opacity-60"
              id="ai-generate-all-btn"
            >
              {isGeneratingAll ? (
                <>
                  <Spinner size={18} />
                  선택지 이미지를 생성하고 있어요...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  ✨ 모든 선택지 AI 이미지 일괄 생성
                </>
              )}
            </button>
          )}
        </div>

        {/* 대표 이미지 미리보기 (선택지 이미지로 자동 구성) */}
        {optionsWithImages.length >= 2 && (
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <ImageIcon size={15} />
              대표 이미지 미리보기
            </label>
            <div className="glass-card rounded-2xl p-3 overflow-hidden">
              <div className={`grid gap-2 ${
                optionsWithImages.length === 2 ? 'grid-cols-2' :
                optionsWithImages.length === 3 ? 'grid-cols-3' :
                optionsWithImages.length === 4 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {optionsWithImages.map((opt, i) => (
                  <div key={opt.id} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={opt.imageUrl}
                      alt={opt.label}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 text-xs font-bold text-gray-800">
                        {String.fromCharCode(65 + i)}. {opt.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted text-center mt-2">
                투표 목록에서 이 이미지들이 대표 이미지로 사용됩니다
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!isValid}
            className="btn btn-secondary flex-1 disabled:opacity-40"
          >
            <Eye size={16} />
            미리보기
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="btn btn-primary flex-1 text-base py-3 disabled:opacity-40"
            id="create-poll-submit"
          >
            🗳️ 투표 개설하기
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-modal-bg-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="w-full max-w-md glass-card rounded-2xl shadow-xl animate-modal-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 대표 이미지: 선택지 이미지 그리드 */}
            {optionsWithImages.length >= 2 && (
              <div className={`grid ${optionsWithImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {optionsWithImages.map((opt) => (
                  <div key={opt.id} className="relative aspect-[4/3]">
                    <Image
                      src={opt.imageUrl}
                      alt={opt.label}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="p-5">
              <span className="text-xs font-semibold text-primary">{category || '미분류'}</span>
              <h3 className="text-xl font-bold text-text-primary mt-1">{title || '제목 없음'}</h3>
              {description && (
                <p className="text-sm text-text-secondary mt-1">{description}</p>
              )}
              <div className="mt-4 space-y-2">
                {filledOptions.map((opt, i) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover"
                  >
                    <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt.imageUrl && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={opt.imageUrl}
                          alt={opt.label}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-text-primary">{opt.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-full mt-4 btn btn-secondary"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
