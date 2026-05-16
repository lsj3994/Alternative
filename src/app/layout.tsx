import type { Metadata } from "next";
import { Noto_Sans_KR, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

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
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-6 text-center text-sm text-text-secondary">
          <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 방구석 백분토론. 모든 논쟁은 투표로 해결합니다. 🗳️</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
