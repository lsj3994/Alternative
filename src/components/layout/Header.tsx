'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Vote, Plus, Sun, Moon, Menu, X, User, LogOut, MessageSquare, Mail, Info } from 'lucide-react';
import { getTheme, saveTheme, getUser, logout } from '@/lib/store';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const theme = getTheme();
    setIsDark(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');

    const user = getUser();
    if (user) setNickname(user.nickname);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    saveTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const handleLogout = () => {
    logout();
    setNickname(null);
    window.location.reload();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-card shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          id="header-logo"
        >
          <span className="text-2xl group-hover:animate-bounce-sm">🗳️</span>
          <span className="text-lg font-bold gradient-text hidden sm:inline">
            방구석 백분토론
          </span>
          <span className="text-lg font-bold gradient-text sm:hidden">
            백분토론
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/about"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-light transition-all"
            id="nav-about"
          >
            <Info size={16} />
            소개
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-light transition-all"
            id="nav-home"
          >
            <Vote size={16} />
            투표 목록
          </Link>
          <Link
            href="/opinions"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-light transition-all"
            id="nav-opinions"
          >
            <MessageSquare size={16} />
            한줄 의견
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary-light transition-all"
            id="nav-contact"
          >
            <Mail size={16} />
            문의하기
          </Link>
          <Link
            href="/create"
            className="btn btn-primary text-sm"
            id="nav-create"
          >
            <Plus size={16} />
            투표 개설
          </Link>

          {/* User / Auth */}
          {nickname ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
                title="회원 정보"
                id="header-profile-link"
              >
                <User size={14} />
                {nickname}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="로그아웃"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:text-primary transition-all"
                id="nav-login"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-all"
                id="nav-signup"
              >
                가입하기
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="ml-1 p-2 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="테마 전환"
            id="theme-toggle"
          >
            {isDark ? (
              <Sun size={18} className="text-accent" />
            ) : (
              <Moon size={18} className="text-primary" />
            )}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {nickname && (
            <Link
              href="/profile"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all"
              title="회원 정보"
              id="mobile-profile-link"
            >
              <User size={12} />
              {nickname}
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="테마 전환"
          >
            {isDark ? (
              <Sun size={18} className="text-accent" />
            ) : (
              <Moon size={18} className="text-primary" />
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="메뉴"
            id="mobile-menu-toggle"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-card border-t border-border animate-fade-in-down">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/about"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
              id="mobile-nav-about"
            >
              <Info size={16} />
              소개
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Vote size={16} />
              투표 목록
            </Link>
            <Link
              href="/opinions"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
              id="mobile-nav-opinions"
            >
              <MessageSquare size={16} />
              한줄 의견
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
              id="mobile-nav-contact"
            >
              <Mail size={16} />
              문의하기
            </Link>
            <Link
              href="/create"
              className="btn btn-primary text-sm justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus size={16} />
              투표 개설
            </Link>
            {!nickname ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary bg-surface-hover hover:bg-surface-active transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary bg-primary-light hover:bg-primary hover:text-white transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} />
                  가입하기
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
