'use client';

import { Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        홈으로 돌아가기
      </button>

      {/* Header */}
      <section className="text-center animate-fade-in mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-4">
          <Shield size={14} />
          개인정보 보호정책
        </div>
        <h1 className="text-3xl font-extrabold mb-3">개인정보처리방침</h1>
        <p className="text-text-secondary text-sm">
          시행일자: 2026년 6월 28일
        </p>
      </section>

      {/* Content */}
      <div className="glass-card p-6 md:p-8 space-y-6 text-sm text-text-secondary leading-relaxed border border-border/40 animate-fade-in-up">
        <p className="text-text-primary font-medium">
          방구석 백분토론(이하 &apos;서비스&apos;)은 이용자의 개인정보를 매우 중요시하며, &apos;개인정보 보호법&apos; 및 &apos;정보통신망 이용촉진 및 정보보호 등에 관한 법률&apos; 등 관련 법령을 준수하고 있습니다. 본 개인정보처리방침은 서비스가 이용자로부터 어떤 정보를 수집하고 어떻게 이용하는지 상세히 안내합니다.
        </p>

        <hr className="border-border/50" />

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">1. 수집하는 개인정보 항목</h3>
          <p>서비스는 회원가입, 원활한 고객 상담, 투표 통계 분석 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>회원 가입 시</strong>: 아이디(로그인 ID), 비밀번호, 닉네임, 성별, 출생년도, 활동 지역</li>
            <li><strong>서비스 이용 과정 중 자동 수집 항목</strong>: 접속 로그, 쿠키(Cookie), 접속 IP 정보, 브라우저 정보</li>
            <li><strong>고객 센터 문의 시</strong>: 성함/닉네임, 이메일 주소</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">2. 개인정보의 수집 및 이용 목적</h3>
          <p>수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>투표 및 통계 제공</strong>: 성별, 연령대, 지역별 투표 분포도 및 시각화 데이터 생성</li>
            <li><strong>회원 관리</strong>: 회원제 서비스 이용에 따른 본인 식별, 불량 회원의 부정 이용 방지, 가입 의사 확인</li>
            <li><strong>고객 상담 및 민원 처리</strong>: 고객 센터 문의 접수 및 답변 처리</li>
            <li><strong>신규 서비스 개발 및 광고 활용</strong>: 사용자 통계에 기반한 맞춤형 서비스 제공 및 광고(구글 애드센스 등) 노출</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">3. 쿠키(Cookie)의 운용 및 구글 애드센스 광고 노출</h3>
          <p>서비스는 이용자에게 개인화되고 맞춤화된 서비스를 제공하기 위해 &apos;쿠키(Cookie)&apos;를 사용합니다. 쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로, 이용자의 컴퓨터 하드디스크에 저장됩니다.</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>쿠키 사용 목적</strong>: 이용자의 접속 빈도나 방문 시간 분석, 투표 이력 및 로그인 유지 상태 확인</li>
            <li><strong>구글 애드센스(Google AdSense) 연동</strong>: 본 서비스는 구글(Google)에서 제공하는 웹 광고 서비스를 게재합니다. 구글은 쿠키를 사용하여 이용자의 본 사이트 및 다른 사이트 방문 이력을 바탕으로 맞춤형 광고를 게재합니다.</li>
            <li><strong>쿠키 설정 거부 방법</strong>: 이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 
              <br /><span className="text-xs text-text-muted">(예: Chrome 기준: 설정 &gt; 개인정보 및 보안 &gt; 인터넷 사용 기록 삭제 또는 쿠키 차단 설정)</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">4. 개인정보의 보유 및 이용 기간</h3>
          <p>원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 경우 예외로 합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>회원 탈퇴 시</strong>: 수집된 유저 개인정보는 즉시 파기됩니다.</li>
            <li><strong>고객 문의 내역</strong>: 브라우저 내부 스토리지에 로컬 캐시 형태로 저장되며 언제든 삭제 가능합니다.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">5. 개인정보 보호책임자 및 문의처</h3>
          <p>서비스는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.</p>
          <div className="p-4 rounded-xl bg-surface-hover border border-border text-xs space-y-1.5 mt-2">
            <p><strong>개인정보 보호책임자</strong>: 방구석 백분토론 운영팀</p>
            <p><strong>이메일 주소</strong>: <a href="mailto:life.is.good@kakao.com" className="text-primary hover:underline">life.is.good@kakao.com</a></p>
            <p>💡 개인정보 처리와 관련된 문의사항은 위의 이메일 주소로 보내주시면 친절하게 처리해 드리겠습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
