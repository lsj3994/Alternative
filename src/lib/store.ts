// ============================================================
// 방구석 백분토론 — 로컬 스토리지 유틸리티
// ============================================================

import { Demographics, Comment, Vote, User, Poll } from './types';

const KEYS = {
  USER: 'bangtoron_user',
  DEMOGRAPHICS: 'bangtoron_demographics',
  VOTES: 'bangtoron_votes',
  COMMENTS: 'bangtoron_comments',
  THEME: 'bangtoron_theme',
  NICKNAME: 'bangtoron_nickname',
  USER_POLLS: 'bangtoron_user_polls',
} as const;

// ---- 안전한 localStorage 접근 ----
function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage full or unavailable
  }
}

// ---- Demographics ----
export function saveDemographics(data: Demographics): void {
  setItem(KEYS.DEMOGRAPHICS, JSON.stringify(data));
}

export function getDemographics(): Demographics | null {
  const raw = getItem(KEYS.DEMOGRAPHICS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Demographics;
  } catch {
    return null;
  }
}

export function hasDemographics(): boolean {
  return getDemographics() !== null;
}

// ---- Votes ----
export function saveVote(vote: Vote): void {
  const votes = getVotes();
  votes.push(vote);
  setItem(KEYS.VOTES, JSON.stringify(votes));
}

export function getVotes(): Vote[] {
  const raw = getItem(KEYS.VOTES);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Vote[];
  } catch {
    return [];
  }
}

export function hasVoted(pollId: string): string | null {
  const votes = getVotes();
  const vote = votes.find((v) => v.pollId === pollId);
  return vote ? vote.optionId : null;
}

// ---- Comments ----
export function saveComment(comment: Comment): void {
  const comments = getAllComments();
  comments.push(comment);
  setItem(KEYS.COMMENTS, JSON.stringify(comments));
}

export function getAllComments(): Comment[] {
  const raw = getItem(KEYS.COMMENTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Comment[];
  } catch {
    return [];
  }
}

export function getComments(pollId: string): Comment[] {
  return getAllComments().filter((c) => c.pollId === pollId);
}

// ---- Theme ----
export function saveTheme(theme: 'dark' | 'light'): void {
  setItem(KEYS.THEME, theme);
}

export function getTheme(): 'dark' | 'light' {
  const raw = getItem(KEYS.THEME);
  return raw === 'dark' ? 'dark' : 'light'; // 기본: 라이트 (토스 스타일)
}

// ---- Nickname ----
export function saveNickname(nickname: string): void {
  setItem(KEYS.NICKNAME, nickname);
}

export function getNickname(): string {
  const user = getUser();
  return user?.nickname || getItem(KEYS.NICKNAME) || '';
}

// ---- User Registration (회원가입) ----
export function saveUser(user: User): void {
  setItem(KEYS.USER, JSON.stringify(user));
  // 닉네임도 별도 저장 (호환)
  saveNickname(user.nickname);
  // Demographics도 자동 생성
  const currentYear = new Date().getFullYear();
  const age = currentYear - user.birthYear;
  let ageGroup: Demographics['ageGroup'];
  if (age < 20) ageGroup = '10s';
  else if (age < 30) ageGroup = '20s';
  else if (age < 40) ageGroup = '30s';
  else if (age < 50) ageGroup = '40s';
  else if (age < 60) ageGroup = '50s';
  else ageGroup = '60s+';
  saveDemographics({ gender: user.gender, ageGroup, region: user.region });
}

export function getUser(): User | null {
  const raw = getItem(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.DEMOGRAPHICS);
    localStorage.removeItem(KEYS.NICKNAME);
  } catch { /* ignore */ }
}

// ---- User Created Polls ----
export function saveUserPoll(poll: Poll): void {
  const polls = getUserPolls();
  polls.push(poll);
  setItem(KEYS.USER_POLLS, JSON.stringify(polls));
}

export function getUserPolls(): Poll[] {
  const raw = getItem(KEYS.USER_POLLS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Poll[];
  } catch {
    return [];
  }
}
