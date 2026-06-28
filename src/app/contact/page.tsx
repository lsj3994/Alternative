'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, HelpCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import { getUser } from '@/lib/store';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'resolved';
  reply?: string;
}

const INQUIRY_TYPES = [
  '일반 문의',
  '기능 제안',
  '버그 제보',
  '제휴 및 광고',
  '기타',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('일반 문의');
  const [message, setMessage] = useState('');
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // 유저 정보가 있으면 기본 이름 세팅
    const user = getUser();
    if (user) {
      setName(user.nickname);
    }

    // 로컬 스토리지에서 내 문의 내역 불러오기
    const stored = localStorage.getItem('bangtoron_contacts');
    if (stored) {
      try {
        setInquiries(JSON.parse(stored));
      } catch {
        // 무시
      }
    } else {
      // 기본 더미 데이터 1개 추가
      const dummy: ContactInquiry = {
        id: 'contact-dummy',
        name: user?.nickname || '홍길동',
        email: 'user@example.com',
        type: '기능 제안',
        message: '더 다양한 주제의 투표 카테고리가 개설되면 좋겠습니다! 특히 엔터테인먼트나 여행 관련 카테고리도 추가해 주세요.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        reply: '안녕하세요. 방구석 백분토론 운영진입니다. 제안해주신 대로 최근 여행 카테고리가 신설되었습니다! 앞으로도 유저분들의 의견을 적극 수렴하겠습니다. 감사합니다.',
      };
      setInquiries([dummy]);
      localStorage.setItem('bangtoron_contacts', JSON.stringify([dummy]));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const newInquiry: ContactInquiry = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      type,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    localStorage.setItem('bangtoron_contacts', JSON.stringify(updated));

    // 입력 필드 초기화 (이름, 이메일은 유지)
    setMessage('');
    
    // 토스트 알림 표시
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-xl flex items-center gap-2 animate-fade-in-up">
          <span>📨 문의가 정상적으로 접수되었습니다.</span>
        </div>
      )}

      {/* Header */}
      <section className="text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-4">
          <Mail size={14} />
          고객 센터
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          <span className="gradient-text">문의하기</span> (Contact Us)
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-lg mx-auto">
          불편한 점이 있으시거나 건의하고 싶은 의견이 있다면 자유롭게 적어주세요. 
          운영진이 신속하게 확인하여 조치하겠습니다.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Form Section */}
        <section className="md:col-span-3 glass-card p-6 md:p-8 animate-fade-in-up border border-border/40">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <HelpCircle className="text-primary" size={20} />
            문의 접수 작성
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                성함 / 닉네임 <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해 주세요"
                className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-border text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-primary transition-colors font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                답변 받을 이메일 주소 <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-border text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-primary transition-colors font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                문의 유형 <span className="text-primary">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INQUIRY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`pill ${type === t ? 'active' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">
                문의 내용 <span className="text-primary">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="문의하실 구체적인 내용을 입력해 주세요..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-surface-hover border border-border text-text-primary placeholder-text-muted text-sm resize-none focus:outline-none focus:border-primary transition-colors font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <Send size={15} />
              문의 접수하기
            </button>
          </form>
        </section>

        {/* Info Card Section */}
        <section className="md:col-span-2 space-y-6 animate-fade-in-up stagger-1">
          <div className="glass-card p-6 border border-border/40 bg-primary-light/30">
            <h3 className="font-bold text-lg text-primary mb-3">자주 묻는 질문 (FAQ)</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-bold text-text-primary">Q. 투표 결과 통계는 언제 보이나요?</p>
                <p className="text-text-secondary mt-1">내가 투표권을 모두 사용한 후 즉시 상세 결과 및 통계 탭을 열어 확인할 수 있습니다.</p>
              </div>
              <div>
                <p className="font-bold text-text-primary">Q. 작성한 댓글을 삭제하고 싶어요.</p>
                <p className="text-text-secondary mt-1">본인이 로그인 상태로 작성한 댓글의 경우 댓글 영역 우측 상단에서 간편히 삭제가 가능합니다.</p>
              </div>
              <div>
                <p className="font-bold text-text-primary">Q. 로그인하지 않고도 이용이 가능한가요?</p>
                <p className="text-text-secondary mt-1">투표 참여는 비가입자(게스트) 상태로도 즉시 가능하지만, 투표 개설 및 토론장 내 댓글 작성은 회원 로그인 후 이용하실 수 있습니다.</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-border/40 text-sm text-text-secondary space-y-2">
            <h3 className="font-bold text-base text-text-primary mb-2">운영 안내</h3>
            <p>💻 문의 메일: <a href="mailto:life.is.good@kakao.com" className="text-primary hover:underline font-semibold">life.is.good@kakao.com</a></p>
            <p>💡 본 웹사이트는 개인이 취미 활동으로 제작하여 운영하고 있습니다. 이에 따라 서비스 유지 보수 및 접수된 문의에 대한 답변 제공에 시간이 다소 소요될 수 있는 점 양해 부탁드립니다.</p>
            <p>🤝 홈페이지 제휴 및 협업 관련 문의는 위의 이메일 주소로 직접 내용을 정리하여 보내 주시기 바랍니다.</p>
          </div>
        </section>
      </div>

      {/* Inquiry History Section */}
      <section className="glass-card p-6 md:p-8 animate-fade-in-up stagger-2 border border-border/40">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          내 문의 내역
        </h2>
        {inquiries.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p className="text-3xl mb-2">📥</p>
            <p className="text-sm">아직 접수된 문의 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-xl bg-surface-hover border border-border/50 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {inq.type}
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(inq.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className={`badge text-xs ${
                    inq.status === 'resolved' 
                      ? 'bg-green-500/10 text-success' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {inq.status === 'resolved' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        답변완료
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        접수완료
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-sm text-text-primary font-medium whitespace-pre-line leading-relaxed">
                  {inq.message}
                </p>
                {inq.reply && (
                  <div className="p-4 rounded-lg bg-surface border-l-4 border-success/70 space-y-1">
                    <p className="text-xs font-bold text-success flex items-center gap-1">
                      <span>💡</span> 운영자 답변
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                      {inq.reply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
