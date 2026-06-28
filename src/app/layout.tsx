import type { Metadata } from "next";
import { Noto_Sans_KR, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Link from "next/link";
import Script from "next/script";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "방구석 백분토론 | 투표하고 논쟁하자!",
  description:
    "대중적인 관심사 및 논쟁거리에 대한 투표, 통계 시각화, 토론 플랫폼. 짜장면 vs 짬뽕, 산 vs 바다 — 당신의 선택은?",
  keywords: ["투표", "토론", "백분토론", "VS", "설문", "통계"],
  openGraph: {
    title: "방구석 백분토론",
    description: "당신의 한 표가 인터넷 논쟁의 역사를 바꿉니다!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-sm text-text-secondary bg-surface-hover/30">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <div className="flex justify-center gap-4 text-xs font-semibold text-text-muted">
              <Link href="/about" className="hover:text-primary transition-colors">
                서비스 소개
              </Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                개인정보처리방침
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-primary transition-colors">
                이용약관
              </Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-primary transition-colors">
                고객센터
              </Link>
            </div>
            <p>© 2026 방구석 백분토론. 모든 논쟁은 투표로 해결합니다. 🗳️</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
