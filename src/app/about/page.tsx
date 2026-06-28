'use client';

import Link from 'next/link';
import { Info, HelpCircle, Code, MessageSquarePlus, Share2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary-light mb-6">
          <Info size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4">
          방구석 백분토론은 <br className="sm:hidden" />
          <span className="gradient-text">어떻게 시작되었을까요?</span>
        </h1>
        <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mt-3">
          사소하고 흥미진진한 일상의 갈등들을 투표와 실시간 통계로 투명하게 들여다보는 놀이터를 만드는 여정입니다.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Vibe Coding Story */}
        <div className="glass-card rounded-3xl p-8 border-l-4 border-primary shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
              <Code size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-text-primary">
              트렌디한 &apos;바이브 코딩&apos;의 실현
            </h3>
          </div>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            최근 전 세계 개발 트렌드로 큰 화제를 모으고 있는 <strong>&apos;바이브 코딩(Vibe Coding)&apos;</strong>에 영감을 받았습니다. 
            무겁고 복잡한 기존 설계 관행에서 벗어나, 순수한 아이디어와 강력한 AI 협업의 시너지를 통해 실시간 페어 프로그래밍의 &apos;바이브&apos;만으로 생각을 빠르게 화면으로 구체화했습니다.
          </p>
        </div>

        {/* Realize Ideas */}
        <div className="glass-card rounded-3xl p-8 border-l-4 border-accent shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up delay-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-text-primary">
              상상만 하던 일상의 아규먼트들
            </h3>
          </div>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            &apos;된장찌개 vs 김치찌개&apos;, &apos;탕수육 부먹 vs 찍먹&apos; 같이 머릿속으로만 투닥거리던 귀여운 논쟁들을 전국의 네티즌들과 투표하고 나이, 성별, 지역별 분포로 직관적인 차트화하여 서로의 생각을 확인하는 유쾌한 공유 공간을 지향합니다.
          </p>
        </div>
      </div>

      {/* Message Box */}
      <div className="glass-card rounded-3xl p-8 md:p-10 mb-16 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-primary/10 text-center animate-fade-in-up delay-200">
        <h2 className="text-2xl font-bold text-text-primary mb-4">🙌 여러분의 관심이 서비스를 성장시킵니다</h2>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
          본 홈페이지는 개인 개발자의 취미 프로젝트로 기획/유지보수되고 있어 아직 부족한 부분이나 숨겨진 버그가 있을 수 있습니다. 
          더 재미있고 편안한 공간이 될 수 있도록 여러분이 사이트를 직접 이용해보시면서 발견한 모든 의견들을 기다리고 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          {/* Contact Link */}
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white font-bold text-sm transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            <MessageSquarePlus size={16} />
            보완점 의견 제출하기
            <ArrowRight size={14} />
          </Link>
          {/* Share Notice */}
          <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-surface border border-border text-text-primary font-bold text-sm transition-all hover:bg-surface-hover hover:scale-[1.02] active:scale-[0.98]">
            <Share2 size={16} className="text-accent" />
            많은 홍보 부탁드립니다!
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <p className="text-center text-xs text-text-muted">
        방구석 백분토론 — Powered by Vibe Coding with AI
      </p>
    </div>
  );
}
