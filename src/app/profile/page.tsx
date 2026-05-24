'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, LogOut, Trash2, Calendar, MapPin, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { getUser, logout, deleteUserAsync } from '@/lib/store';
import { User } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleWithdrawal = async () => {
    if (!user) return;

    const confirmFirst = confirm('정말 회원 탈퇴를 진행하시겠습니까?\n탈퇴 시 회원 정보는 즉시 파기되며 복구할 수 없습니다.');
    if (!confirmFirst) return;

    const confirmSecond = confirm('마지막 확인입니다. 회원 탈퇴를 승인하시겠습니까?');
    if (!confirmSecond) return;

    setIsDeleting(true);
    try {
      const res = await deleteUserAsync(user.id);
      if (res.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('withdrawal_success', '1');
        }
        router.push('/');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        alert(`탈퇴 처리 중 에러가 발생했습니다: ${res.error}`);
      }
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      alert('서버 오류로 인해 탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm text-text-secondary font-medium">프로필을 불러오는 중...</p>
      </div>
    );
  }

  const genderLabels: Record<string, string> = {
    male: '남성 👨',
    female: '여성 👩',
    other: '기타 🧑'
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-fade-in-up">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6 font-semibold"
        id="profile-back-btn"
      >
        <ArrowLeft size={16} />
        홈으로 돌아가기
      </button>

      {/* Profile Card Container */}
      <div className="glass-card rounded-3xl overflow-hidden p-6 md:p-8 shadow-lg border border-border/50">
        {/* User Big Avatar / Header */}
        <div className="flex flex-col items-center border-b border-border/60 pb-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center text-primary mb-4 border-4 border-white shadow-md">
            <UserIcon size={44} />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-1">{user.nickname}</h1>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary-light text-primary">
            <Sparkles size={11} />
            백분토론 회원
          </span>
        </div>

        {/* Info Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm font-semibold text-text-secondary">아이디</span>
            <span className="text-base font-bold text-text-primary">{user.loginId || '미기재'}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm font-semibold text-text-secondary">성별</span>
            <span className="text-base font-bold text-text-primary">{genderLabels[user.gender] || user.gender}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm font-semibold text-text-secondary flex items-center gap-1">
              <Calendar size={14} className="text-text-muted" />
              태어난 년대
            </span>
            <span className="text-base font-bold text-text-primary">{user.birthYear}년대</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm font-semibold text-text-secondary flex items-center gap-1">
              <MapPin size={14} className="text-text-muted" />
              사는 지역
            </span>
            <span className="text-base font-bold text-text-primary">{user.region}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-semibold text-text-secondary">가입 일자</span>
            <span className="text-base font-bold text-text-primary">{formattedDate}</span>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="mt-8 pt-4 space-y-3">
          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            disabled={isDeleting}
            className="w-full btn btn-secondary py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-border/60 text-base hover:bg-surface-hover hover:border-border transition-all"
            id="profile-logout-btn"
          >
            <LogOut size={18} />
            로그아웃
          </button>

          {/* 회원 탈퇴 */}
          <button
            onClick={handleWithdrawal}
            disabled={isDeleting}
            className="w-full btn bg-danger/10 border border-danger/20 text-danger py-3.5 rounded-2xl flex items-center justify-center gap-2 text-base hover:bg-danger/20 transition-all font-bold"
            id="profile-delete-btn"
          >
            {isDeleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                탈퇴 처리 중...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                회원 탈퇴 (계정 삭제)
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-text-muted text-center mt-6">
        회원 정보 및 투표 참여 데이터 통계는 탈퇴 시 즉각 파기되며 복구할 수 없습니다.
      </p>
    </div>
  );
}
