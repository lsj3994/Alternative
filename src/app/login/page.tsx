'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, User as UserIcon, Loader2 } from 'lucide-react';
import { loginAsync } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!loginId.trim()) {
      newErrors.loginId = '아이디를 입력해주세요';
    }
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await loginAsync(loginId.trim(), password);
      if (res.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('login_success', '1');
        }
        router.push('/');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setServerError(res.error || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      console.error('로그인 중 에러 발생:', err);
      setServerError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light mb-4">
            <LogIn size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">로그인</h1>
          <p className="text-sm text-text-secondary mt-2">
            가입한 아이디와 비밀번호로 로그인하세요
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-5 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm font-semibold flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 아이디 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <UserIcon size={15} />
              아이디
            </label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="아이디 입력"
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-text-primary placeholder-text-muted text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.loginId
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="login-id"
            />
            {errors.loginId && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.loginId}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <span className="text-sm">🔑</span>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-text-primary placeholder-text-muted text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="login-password"
            />
            {errors.password && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary text-base py-4 rounded-2xl mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            id="login-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* Footer options */}
        <div className="text-center mt-6 text-sm">
          <span className="text-text-muted">아직 회원이 아니신가요? </span>
          <Link href="/signup" className="text-primary font-bold hover:underline">
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
