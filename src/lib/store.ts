// ============================================================
// 방구석 백분토론 — 로컬 스토리지 유틸리티 + Supabase 연동
// ============================================================

import { Demographics, Comment, Vote, User, Poll } from './types';
import { canUseSupabase } from './supabase-db';
import {
  dbCreateUser,
  dbCastVote,
  dbGetVotedOptions,
  dbCreateComment,
  dbCreatePoll,
  dbLikeComment,
  dbDislikeComment,
  dbCancelVotes,
} from './supabase-db';

const KEYS = {
  USER: 'bangtoron_user',
  DEMOGRAPHICS: 'bangtoron_demographics',
  VOTES: 'bangtoron_votes',
  COMMENTS: 'bangtoron_comments',
  THEME: 'bangtoron_theme',
  NICKNAME: 'bangtoron_nickname',
  USER_POLLS: 'bangtoron_user_polls',
  GUEST_ID: 'bangtoron_guest_id',
  LOCAL_USERS: 'bangtoron_local_users',
} as const;

export function getLocalUsers(): User[] {
  const raw = getItem(KEYS.LOCAL_USERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function saveLocalUser(user: User): void {
  const users = getLocalUsers();
  if (!users.some(u => u.id === user.id || (u.loginId && u.loginId === user.loginId))) {
    users.push(user);
    setItem(KEYS.LOCAL_USERS, JSON.stringify(users));
  }
}

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
export function getMaxVotes(): number {
  return isLoggedIn() ? 3 : 1;
}

export function getGuestId(): string {
  let guestId = getItem(KEYS.GUEST_ID);
  if (!guestId) {
    guestId = `guest-${Date.now()}`;
    setItem(KEYS.GUEST_ID, guestId);
    if (canUseSupabase()) {
      dbCreateUser({
        id: guestId,
        nickname: '미가입자',
        gender: 'other',
        birthYear: 2000,
        region: '미가입자',
        createdAt: new Date().toISOString(),
      }).catch((err) => console.warn('[Supabase] Guest 생성 실패:', err));
    }
  }
  return guestId;
}

export function getCurrentUserId(): string {
  const user = getUser();
  return user ? user.id : getGuestId();
}

export function saveVote(vote: Vote): boolean {
  const votes = getVotes();
  const pollVotes = votes.filter((v) => v.pollId === vote.pollId);
  const maxVotes = getMaxVotes();

  // 이미 최대 투표 수에 도달했으면 저장하지 않음
  if (pollVotes.length >= maxVotes) return false;

  // 비회원이면 게스트 정보로 투표 기록 수정
  const isGuest = !isLoggedIn();
  const finalVote = {
    ...vote,
    userId: getCurrentUserId(),
    gender: isGuest ? ('미가입자' as any) : vote.gender,
    ageGroup: isGuest ? ('미가입자' as any) : vote.ageGroup,
    region: isGuest ? '미가입자' : vote.region,
  };

  votes.push(finalVote);
  setItem(KEYS.VOTES, JSON.stringify(votes));

  // Supabase에도 비동기 저장 (실패해도 로컬에는 저장됨)
  if (canUseSupabase()) {
    dbCastVote(finalVote).catch((err) => console.warn('[Supabase] Vote 저장 실패:', err));
  }

  return true;
}

export function cancelVote(pollId: string): void {
  const votes = getVotes();
  const userId = getCurrentUserId();
  const newVotes = votes.filter((v) => !(v.pollId === pollId && v.userId === userId));
  setItem(KEYS.VOTES, JSON.stringify(newVotes));

  if (canUseSupabase()) {
    dbCancelVotes(pollId, userId).catch((err) => console.warn('[Supabase] Vote 취소 실패:', err));
  }
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

/** 해당 투표에서 사용자가 투표한 옵션 ID 배열을 반환 */
export function getVotedOptions(pollId: string): string[] {
  const votes = getVotes();
  return votes.filter((v) => v.pollId === pollId).map((v) => v.optionId);
}

/** 해당 투표에서 사용자가 사용한 투표 수를 반환 */
export function getVoteCountForPoll(pollId: string): number {
  return getVotedOptions(pollId).length;
}

/** 해당 투표에서 추가 투표 가능 여부 */
export function canVoteMore(pollId: string): boolean {
  return getVoteCountForPoll(pollId) < getMaxVotes();
}

/** @deprecated 하위 호환용 — getVotedOptions 사용 권장 */
export function hasVoted(pollId: string): string | null {
  const options = getVotedOptions(pollId);
  return options.length > 0 ? options[0] : null;
}

/** Supabase에서 투표 기록 동기화 */
export async function syncVotedOptions(pollId: string, userId: string): Promise<string[]> {
  if (!canUseSupabase()) return getVotedOptions(pollId);

  try {
    const dbOptions = await dbGetVotedOptions(pollId, userId);
    if (dbOptions.length > 0) {
      // DB 결과를 로컬에도 반영
      const votes = getVotes();
      for (const optionId of dbOptions) {
        if (!votes.some((v) => v.pollId === pollId && v.optionId === optionId)) {
          votes.push({
            id: `vote-sync-${Date.now()}-${optionId}`,
            pollId,
            optionId,
            userId,
            createdAt: new Date().toISOString(),
          });
        }
      }
      setItem(KEYS.VOTES, JSON.stringify(votes));
      return dbOptions;
    }
  } catch (err) {
    console.warn('[Supabase] 투표 기록 동기화 실패:', err);
  }

  return getVotedOptions(pollId);
}

// ---- Comments ----
export function saveComment(comment: Comment): void {
  const comments = getAllComments();
  comments.push(comment);
  setItem(KEYS.COMMENTS, JSON.stringify(comments));

  // Supabase에도 비동기 저장
  if (canUseSupabase()) {
    dbCreateComment(comment).catch((err) => console.warn('[Supabase] Comment 저장 실패:', err));
  }
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

/** 댓글 좋아요 — Supabase 연동 */
export function likeCommentSync(commentId: string): void {
  if (canUseSupabase()) {
    dbLikeComment(commentId).catch((err) => console.warn('[Supabase] Like 실패:', err));
  }
}

/** 댓글 싫어요 — Supabase 연동 */
export function dislikeCommentSync(commentId: string): void {
  if (canUseSupabase()) {
    dbDislikeComment(commentId).catch((err) => console.warn('[Supabase] Dislike 실패:', err));
  }
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
export async function saveUserAsync(user: User): Promise<{ success: boolean; error?: string }> {
  // Supabase에 저장 시도
  if (canUseSupabase()) {
    const { dbCheckLoginIdDuplicate, dbCreateUser } = await import('./supabase-db');
    if (user.loginId) {
      const isDup = await dbCheckLoginIdDuplicate(user.loginId);
      if (isDup) {
        return { success: false, error: '이미 사용 중인 아이디입니다.' };
      }
    }
    const result = await dbCreateUser(user);
    if (!result.success) {
      return result; // 닉네임 중복 등의 에러
    }
  } else {
    // 로컬 폴백 중복 체크
    if (user.loginId) {
      const localUsers = getLocalUsers();
      if (localUsers.some((u) => u.loginId === user.loginId)) {
        return { success: false, error: '이미 사용 중인 아이디입니다.' };
      }
      if (localUsers.some((u) => u.nickname === user.nickname)) {
        return { success: false, error: '이미 사용 중인 닉네임입니다.' };
      }
    }
  }

  // 로컬에도 저장 (캐시)
  saveUserLocal(user);
  return { success: true };
}

/** 로컬 저장만 (동기) */
export function saveUserLocal(user: User): void {
  setItem(KEYS.USER, JSON.stringify(user));
  saveNickname(user.nickname);
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

  // 전체 로컬 가입 유저 목록에도 캐시
  saveLocalUser(user);
}

/** 로그인 기능 (Supabase 우선 -> 로컬 폴백) */
export async function loginAsync(loginId: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (canUseSupabase()) {
    try {
      const { dbLoginUser } = await import('./supabase-db');
      const res = await dbLoginUser(loginId, password);
      if (res.success && res.user) {
        saveUserLocal(res.user);
        return { success: true };
      }
      return { success: false, error: res.error || '로그인 실패' };
    } catch (err) {
      console.warn('[Supabase] 로그인 에러, 로컬 폴백 시도:', err);
    }
  }

  // 로컬스토리지 폴백 로그인
  const localUsers = getLocalUsers();
  const found = localUsers.find((u) => u.loginId === loginId && u.password === password);
  if (found) {
    saveUserLocal(found);
    return { success: true };
  }
  return { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
}

/** @deprecated 동기 버전 — saveUserAsync 사용 권장 */
export function saveUser(user: User): void {
  saveUserLocal(user);
  // Supabase에도 비동기 저장 시도
  if (canUseSupabase()) {
    dbCreateUser(user).catch((err) => console.warn('[Supabase] User 저장 실패:', err));
  }
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

/** 회원 탈퇴 기능 (Supabase 우선 -> 로컬 폴백) */
export async function deleteUserAsync(id: string): Promise<{ success: boolean; error?: string }> {
  if (canUseSupabase()) {
    try {
      const { dbDeleteUser } = await import('./supabase-db');
      const res = await dbDeleteUser(id);
      if (!res.success) {
        return res;
      }
    } catch (err) {
      console.warn('[Supabase] 유저 삭제 에러, 로컬로 계속 진행:', err);
    }
  }

  // 로컬스토리지 전체 가입 유저 목록에서 제거
  const localUsers = getLocalUsers();
  const updatedUsers = localUsers.filter((u) => u.id !== id);
  setItem(KEYS.LOCAL_USERS, JSON.stringify(updatedUsers));

  // 로그아웃 처리 (로그인 세션 지우기)
  logout();

  return { success: true };
}

// ---- User Created Polls ----
export async function saveUserPollAsync(poll: Poll): Promise<{ success: boolean; error?: string }> {
  // Supabase에 저장 시도
  if (canUseSupabase()) {
    const result = await dbCreatePoll(
      {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        thumbnailUrl: poll.thumbnailUrl,
        category: poll.category,
        options: poll.options,
        createdAt: poll.createdAt,
        createdBy: poll.createdBy,
      },
      poll.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        imageUrl: opt.imageUrl,
        emoji: opt.emoji,
      }))
    );
    if (!result.success) {
      console.warn('[Supabase] Poll 저장 실패:', result.error);
      // Supabase 실패해도 로컬에는 저장
    }
  }

  // 로컬에도 저장 (캐시)
  saveUserPollLocal(poll);
  return { success: true };
}

/** 로컬에만 저장 */
export function saveUserPollLocal(poll: Poll): void {
  const polls = getUserPolls();
  polls.push(poll);
  setItem(KEYS.USER_POLLS, JSON.stringify(polls));
}

/** @deprecated 동기 버전 — saveUserPollAsync 사용 권장 */
export function saveUserPoll(poll: Poll): void {
  saveUserPollLocal(poll);
  if (canUseSupabase()) {
    dbCreatePoll(
      poll,
      poll.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        imageUrl: opt.imageUrl,
        emoji: opt.emoji,
      }))
    ).catch((err) => console.warn('[Supabase] Poll 저장 실패:', err));
  }
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
