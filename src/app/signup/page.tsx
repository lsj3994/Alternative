'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, MapPin, Calendar, User as UserIcon, Loader2 } from 'lucide-react';
import { saveUserAsync, saveUser } from '@/lib/store';
import { canUseSupabase } from '@/lib/supabase-db';
import { REGIONS } from '@/lib/data';

export default function SignupPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [region, setRegion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  // 1940년대부터 2010년대까지
  const decadeOptions = [2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940];

  const genderOptions = [
    { value: 'male', label: '남성', emoji: '👨' },
    { value: 'female', label: '여성', emoji: '👩' },
    { value: 'other', label: '기타', emoji: '🧑' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginId.trim()) newErrors.loginId = '아이디를 입력해주세요';
    else if (!/^[a-zA-Z0-9]{4,15}$/.test(loginId.trim())) {
      newErrors.loginId = '4~15자의 영문 대소문자, 숫자만 가능합니다';
    }

    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    else if (password.length < 4) newErrors.password = '비밀번호는 4자 이상이어야 합니다';

    if (!confirmPassword) newErrors.confirmPassword = '비밀번호를 한 번 더 입력해주세요';
    else if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';

    if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    else if (nickname.trim().length < 2) newErrors.nickname = '2자 이상 입력해주세요';
    else if (nickname.trim().length > 12) newErrors.nickname = '12자 이하로 입력해주세요';
    
    if (!gender) newErrors.gender = '성별을 선택해주세요';
    if (!birthYear) newErrors.birthYear = '태어난 해를 선택해주세요';
    if (!region) newErrors.region = '지역을 선택해주세요';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const user = {
      id: `user-${Date.now()}`,
      nickname: nickname.trim(),
      gender: gender as 'male' | 'female' | 'other',
      birthYear: parseInt(birthYear),
      region,
      createdAt: new Date().toISOString(),
      loginId: loginId.trim(),
      password,
    };

    const result = await saveUserAsync(user);
    if (!result.success) {
      if (result.error?.includes('아이디')) {
        setErrors({ loginId: result.error });
      } else {
        setErrors({ nickname: result.error || '가입에 실패했습니다.' });
      }
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('signup_success', '1');
    }
    router.push('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light mb-4">
            <UserPlus size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">가입하기</h1>
          <p className="text-sm text-text-secondary mt-2">
            간단한 정보만 입력하면 바로 투표에 참여할 수 있어요
          </p>
        </div>

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
              placeholder="4~15자 영문, 숫자"
              maxLength={15}
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-text-primary placeholder-text-muted text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.loginId
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="signup-loginid"
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
              placeholder="4자 이상 비밀번호"
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-text-primary placeholder-text-muted text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="signup-password"
            />
            {errors.password && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <span className="text-sm">✔️</span>
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-text-primary placeholder-text-muted text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="signup-confirmpassword"
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.confirmPassword}</p>
            ) : confirmPassword && (
              <p className={`text-xs mt-1.5 ml-1 font-semibold ${
                password === confirmPassword ? 'text-success' : 'text-danger'
              }`}>
                {password === confirmPassword ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
              </p>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <UserIcon size={15} />
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~12자 닉네임"
              maxLength={12}
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-text-primary placeholder-text-muted text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.nickname
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="signup-nickname"
            />
            {errors.nickname && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.nickname}</p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <UserPlus size={15} />
              성별
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value as 'male' | 'female' | 'other')}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ${
                    gender === opt.value
                      ? 'border-primary bg-primary-light'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
            {errors.gender && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.gender}</p>
            )}
          </div>

          {/* 태어난 해 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <Calendar size={15} />
              태어난 년대
            </label>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-base font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all ${
                birthYear ? 'text-text-primary' : 'text-text-muted'
              } ${
                errors.birthYear
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="signup-birthyear"
            >
              <option value="">태어난 년대를 선택하세요</option>
              {decadeOptions.map((y) => (
                <option key={y} value={y}>
                  {y}년대
                </option>
              ))}
            </select>
            {errors.birthYear && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.birthYear}</p>
            )}
          </div>

          {/* 지역 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-2">
              <MapPin size={15} />
              사는 지역
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-2xl bg-surface border text-base font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all ${
                region ? 'text-text-primary' : 'text-text-muted'
              } ${
                errors.region
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
              id="signup-region"
            >
              <option value="">지역을 선택하세요</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.region && (
              <p className="text-xs text-danger mt-1.5 ml-1">{errors.region}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary text-base py-4 rounded-2xl mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            id="signup-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                가입 중...
              </>
            ) : (
              '가입 완료 🎉'
            )}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6">
          가입 시 수집된 정보는 투표 통계에만 사용됩니다.
        </p>
      </div>
    </div>
  );
}
