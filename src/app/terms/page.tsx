'use client';

import { FileText, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
          <FileText size={14} />
          서비스 이용약관
        </div>
        <h1 className="text-3xl font-extrabold mb-3">이용약관</h1>
        <p className="text-text-secondary text-sm">
          시행일자: 2026년 6월 28일
        </p>
      </section>

      {/* Content */}
      <div className="glass-card p-6 md:p-8 space-y-6 text-sm text-text-secondary leading-relaxed border border-border/40 animate-fade-in-up">
        <p className="text-text-primary font-medium">
          방구석 백분토론 서비스(이하 &apos;서비스&apos;)를 이용해 주셔서 감사합니다. 본 이용약관은 서비스를 제공하는 운영팀과 서비스를 이용하는 회원 및 비회원(이하 &apos;이용자&apos;) 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다. 서비스를 이용함으로써 귀하는 본 약관에 동의하는 것으로 간주됩니다.
        </p>

        <hr className="border-border/50" />

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">1. 용어의 정의</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>서비스</strong>: 기기(PC, 휴대폰 등)와 관계없이 이용자가 접속할 수 있는 &apos;방구석 백분토론&apos; 웹 어플리케이션을 의미합니다.</li>
            <li><strong>이용자</strong>: 본 약관에 따라 서비스를 이용하는 회원 및 비회원(게스트)을 통칭합니다.</li>
            <li><strong>회원</strong>: 서비스에 로그인 정보 및 개인정보를 입력하여 회원 계정을 생성한 이용자를 말합니다.</li>
            <li><strong>투표/게시물</strong>: 이용자가 서비스 내에 게시한 투표 주제, 선택지, 댓글, 평론 등 모든 형태의 텍스트와 이미지 정보를 말합니다.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">2. 약관의 효력 및 변경</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>본 약관은 서비스 웹사이트 내에 게시함으로써 효력이 발생합니다.</li>
            <li>서비스는 필요할 경우 관련 법령을 위배하지 않는 범위 내에서 약관을 변경할 수 있습니다. 약관이 변경될 시 시행일자 전 공지하며, 변경 후에도 서비스를 지속적으로 이용하는 것은 약관 변경에 동의한 것으로 간주됩니다.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">3. 서비스의 제공 및 변경 (개인 취미 프로젝트 고지)</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>서비스 성격</strong>: 본 서비스는 개인이 학습 및 취미 목적으로 제작하여 유지 보수하고 있는 **개인 프로젝트 웹 서비스**입니다.</li>
            <li><strong>유지 보수 및 장애 대응</strong>: 개인 운영의 특성상 서버의 일시적 장애, 버그 수정, 사이트 유지 보수 대응 및 문의 답변에 다소 시간이 소요될 수 있습니다.</li>
            <li><strong>서비스 중단</strong>: 운영상의 판단, 서버 비용 문제 또는 기술적 곤란함으로 인해 서비스가 사전 예고 없이 일시 중단되거나 영구 종료될 수 있으며, 이로 인한 이용자의 데이터 손실 등에 대해 운영자는 법적 책임을 지지 않습니다.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">4. 이용자의 의무</h3>
          <p>이용자는 서비스의 평화롭고 건강한 토론 문화를 위해 아래 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인의 정보를 도용하거나 비정상적인 방법으로 회원 가입을 하는 행위</li>
            <li>정치적 선동, 성적 수치심 유발, 특정 집단에 대한 혐오 조장, 혹은 심한 욕설이 포함된 투표글이나 댓글을 작성하는 행위</li>
            <li>홍보, 음란물 링크 등 스팸성 광고 게시물을 무단 등록하는 행위</li>
            <li>시스템 취약점을 악용하거나 투표 수 조작 등의 부정행위를 시도하는 행위</li>
          </ul>
          <p className="text-xs text-text-muted">💡 위 항을 위반한 경우, 운영진은 사전 경고 없이 해당 투표글 및 댓글을 삭제 처리하고 이용 제한 조치를 취할 수 있습니다.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">5. 면책조항 (Disclaimer)</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>서비스 내에 게시된 투표 및 댓글 내용은 개개인의 사적인 의견일 뿐이며, 서비스 운영팀의 공식 입장을 대변하지 않습니다.</li>
            <li>이용자 간의 논쟁, 갈등으로 발생한 정신적, 물질적 피해에 대해 운영진은 어떠한 책임도 지지 않습니다.</li>
            <li>천재지변, 정전, 서비스 호스팅 업체의 문제 등 제3자 요인으로 발생한 서비스 장애에 대해서는 책임을 면합니다.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-text-primary">6. 제휴 및 문의</h3>
          <p>이용 약관에 대한 해석이나 기타 제휴 관련 사항은 아래의 공식 경로를 통해 문의하실 수 있습니다.</p>
          <div className="p-4 rounded-xl bg-surface-hover border border-border text-xs">
            <p>📧 이메일 문의처: <a href="mailto:life.is.good@kakao.com" className="text-primary hover:underline font-bold">life.is.good@kakao.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
