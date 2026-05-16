// ============================================================
// 방구석 백분토론 — 더미 데이터
// ============================================================

import { Poll, Comment, PollStats } from './types';

// ---- 더미 투표 데이터 ----
export const DUMMY_POLLS: Poll[] = [
  {
    id: 'poll-1',
    title: '짜장면 vs 짬뽕',
    description: '중국집 가면 매번 고민하는 그 질문. 당신의 선택은?',
    status: 'active',
    thumbnailUrl: '/images/poll-jjajang.png',
    category: '음식',
    totalVotes: 15782,
    createdAt: '2026-05-10T09:00:00Z',
    options: [
      { id: 'opt-1a', pollId: 'poll-1', label: '짜장면', emoji: '🍜', voteCount: 8234, imageUrl: '/images/poll-jjajang.png' },
      { id: 'opt-1b', pollId: 'poll-1', label: '짬뽕', emoji: '🌶️', voteCount: 7548, imageUrl: '/images/poll-jjajang.png' },
    ],
  },
  {
    id: 'poll-2',
    title: '산 vs 바다',
    description: '여행 갈 때 산이냐 바다냐, 이 논쟁에 종지부를 찍자!',
    status: 'active',
    thumbnailUrl: '/images/poll-mountain-sea.png',
    category: '라이프',
    totalVotes: 23456,
    createdAt: '2026-05-08T12:00:00Z',
    options: [
      { id: 'opt-2a', pollId: 'poll-2', label: '산', emoji: '🏔️', voteCount: 11234, imageUrl: '/images/poll-mountain-sea.png' },
      { id: 'opt-2b', pollId: 'poll-2', label: '바다', emoji: '🌊', voteCount: 12222, imageUrl: '/images/poll-mountain-sea.png' },
    ],
  },
  {
    id: 'poll-3',
    title: '민초 vs 반민초',
    description: '민트초코는 치약맛인가, 신의 조합인가?',
    status: 'active',
    thumbnailUrl: '/images/poll-mintchoco.png',
    category: '음식',
    totalVotes: 31204,
    createdAt: '2026-05-12T15:30:00Z',
    options: [
      { id: 'opt-3a', pollId: 'poll-3', label: '민초파', emoji: '🍫', voteCount: 14502, imageUrl: '/images/poll-mintchoco.png' },
      { id: 'opt-3b', pollId: 'poll-3', label: '반민초파', emoji: '🚫', voteCount: 16702, imageUrl: '/images/poll-mintchoco.png' },
    ],
  },
  {
    id: 'poll-4',
    title: '탕수육 부먹 vs 찍먹',
    description: '아직도 부먹하는 사람이 있습니까? (충격 실화)',
    status: 'active',
    thumbnailUrl: '/images/poll-tangsuyuk.png',
    category: '음식',
    totalVotes: 28901,
    createdAt: '2026-05-11T10:00:00Z',
    options: [
      { id: 'opt-4a', pollId: 'poll-4', label: '부먹', emoji: '🫗', voteCount: 13456, imageUrl: '/images/poll-tangsuyuk.png' },
      { id: 'opt-4b', pollId: 'poll-4', label: '찍먹', emoji: '🥢', voteCount: 15445, imageUrl: '/images/poll-tangsuyuk.png' },
    ],
  },
  {
    id: 'poll-5',
    title: '여름 vs 겨울',
    description: '극한의 더위 vs 극한의 추위, 당신은 어느 쪽?',
    status: 'active',
    thumbnailUrl: '/images/poll-summer-winter.png',
    category: '라이프',
    totalVotes: 19876,
    createdAt: '2026-05-09T08:00:00Z',
    options: [
      { id: 'opt-5a', pollId: 'poll-5', label: '여름', emoji: '☀️', voteCount: 9123, imageUrl: '/images/poll-summer-winter.png' },
      { id: 'opt-5b', pollId: 'poll-5', label: '겨울', emoji: '❄️', voteCount: 10753, imageUrl: '/images/poll-summer-winter.png' },
    ],
  },
  {
    id: 'poll-6',
    title: '고양이 vs 강아지',
    description: '반려동물 논쟁의 끝판왕. 냥이 vs 댕댕이!',
    status: 'active',
    thumbnailUrl: '/images/poll-cat-dog.png',
    category: '라이프',
    totalVotes: 42301,
    createdAt: '2026-05-07T14:00:00Z',
    options: [
      { id: 'opt-6a', pollId: 'poll-6', label: '고양이', emoji: '🐱', voteCount: 21567, imageUrl: '/images/poll-cat-dog.png' },
      { id: 'opt-6b', pollId: 'poll-6', label: '강아지', emoji: '🐶', voteCount: 20734, imageUrl: '/images/poll-cat-dog.png' },
    ],
  },
  {
    id: 'poll-7',
    title: '손흥민 vs 박지성',
    description: '한국 축구 역대 최고의 선수는 누구인가?',
    status: 'active',
    thumbnailUrl: '/images/poll-soccer.png',
    category: '스포츠',
    totalVotes: 35678,
    createdAt: '2026-05-13T18:00:00Z',
    options: [
      { id: 'opt-7a', pollId: 'poll-7', label: '손흥민', emoji: '⚽', voteCount: 20123, imageUrl: '/images/poll-soccer.png' },
      { id: 'opt-7b', pollId: 'poll-7', label: '박지성', emoji: '🏆', voteCount: 15555, imageUrl: '/images/poll-soccer.png' },
    ],
  },
  {
    id: 'poll-8',
    title: '아이폰 vs 갤럭시',
    description: '스마트폰 양대산맥! 당신의 선택은?',
    status: 'active',
    thumbnailUrl: '/images/poll-phone.png',
    category: 'IT/기술',
    totalVotes: 27654,
    createdAt: '2026-05-14T11:00:00Z',
    options: [
      { id: 'opt-8a', pollId: 'poll-8', label: '아이폰', emoji: '🍎', voteCount: 14321, imageUrl: '/images/poll-phone.png' },
      { id: 'opt-8b', pollId: 'poll-8', label: '갤럭시', emoji: '📱', voteCount: 13333, imageUrl: '/images/poll-phone.png' },
    ],
  },
];

// ---- 더미 댓글 데이터 ----
export const DUMMY_COMMENTS: Record<string, Comment[]> = {
  'poll-1': [
    { id: 'cmt-1', pollId: 'poll-1', userId: 'u1', nickname: '면러버', optionId: 'opt-1a', optionLabel: '짜장면', content: '짜장면은 진리다. 고추가루 넣고 단무지 곁들이면 그게 행복이지.', likes: 234, dislikes: 12, createdAt: '2026-05-10T10:30:00Z', isBest: true },
    { id: 'cmt-2', pollId: 'poll-1', userId: 'u2', nickname: '매운맛중독', optionId: 'opt-1b', optionLabel: '짬뽕', content: '짬뽕 국물 한 숟가락이면 세상 모든 근심이 사라집니다.', likes: 189, dislikes: 8, createdAt: '2026-05-10T11:00:00Z' },
    { id: 'cmt-3', pollId: 'poll-1', userId: 'u3', nickname: '양다리파', optionId: 'opt-1a', optionLabel: '짜장면', content: '짬짜면 시키면 안되나요?', likes: 567, dislikes: 23, createdAt: '2026-05-10T12:00:00Z', isBest: true },
    { id: 'cmt-4', pollId: 'poll-1', userId: 'u4', nickname: '짬뽕전도사', optionId: 'opt-1b', optionLabel: '짬뽕', content: '비 오는 날 짬뽕이면 인생 완성 아닙니까.', likes: 145, dislikes: 5, createdAt: '2026-05-10T13:00:00Z' },
    { id: 'cmt-5', pollId: 'poll-1', userId: 'u5', nickname: '분석러', optionId: 'opt-1a', optionLabel: '짜장면', content: '통계적으로 짜장면이 배달 1위입니다. 숫자는 거짓말을 안 해요.', likes: 98, dislikes: 45, createdAt: '2026-05-10T14:00:00Z' },
  ],
  'poll-2': [
    { id: 'cmt-6', pollId: 'poll-2', userId: 'u6', nickname: '등산왕', optionId: 'opt-2a', optionLabel: '산', content: '정상에서 내려다보는 풍경을 모르는 사람은 불쌍합니다.', likes: 312, dislikes: 34, createdAt: '2026-05-08T13:00:00Z', isBest: true },
    { id: 'cmt-7', pollId: 'poll-2', userId: 'u7', nickname: '서핑보이', optionId: 'opt-2b', optionLabel: '바다', content: '파도 소리 들으면서 치맥하는 게 인생이지!', likes: 287, dislikes: 15, createdAt: '2026-05-08T14:00:00Z' },
    { id: 'cmt-8', pollId: 'poll-2', userId: 'u8', nickname: '현실주의자', optionId: 'opt-2b', optionLabel: '바다', content: '산은 올라가야 하잖아요... 바다는 누워만 있어도 됨', likes: 456, dislikes: 67, createdAt: '2026-05-08T15:00:00Z', isBest: true },
  ],
  'poll-3': [
    { id: 'cmt-9', pollId: 'poll-3', userId: 'u9', nickname: '민초러버', optionId: 'opt-3a', optionLabel: '민초파', content: '민트초코 싫어하는 사람들은 아직 진짜 맛을 모르는 거예요.', likes: 523, dislikes: 234, createdAt: '2026-05-12T16:00:00Z' },
    { id: 'cmt-10', pollId: 'poll-3', userId: 'u10', nickname: '치약반대', optionId: 'opt-3b', optionLabel: '반민초파', content: '치약 먹는 기분인데 맛있다고요...? 이해불가.', likes: 612, dislikes: 198, createdAt: '2026-05-12T17:00:00Z', isBest: true },
  ],
  'poll-4': [
    { id: 'cmt-11', pollId: 'poll-4', userId: 'u11', nickname: '부먹장인', optionId: 'opt-4a', optionLabel: '부먹', content: '소스가 골고루 배어야 진짜 탕수육이지. 찍먹은 소스 낭비!', likes: 345, dislikes: 89, createdAt: '2026-05-11T11:00:00Z' },
    { id: 'cmt-12', pollId: 'poll-4', userId: 'u12', nickname: '바삭파', optionId: 'opt-4b', optionLabel: '찍먹', content: '바삭한 튀김옷의 식감을 포기할 수 없습니다.', likes: 412, dislikes: 56, createdAt: '2026-05-11T12:00:00Z', isBest: true },
  ],
};

// ---- 더미 통계 데이터 ----
export const DUMMY_STATS: Record<string, PollStats> = {
  'poll-1': {
    gender: [
      { gender: 'male', label: '남성', counts: { 'opt-1a': 4500, 'opt-1b': 4200 } },
      { gender: 'female', label: '여성', counts: { 'opt-1a': 3734, 'opt-1b': 3348 } },
    ],
    age: [
      { ageGroup: '10s', label: '10대', counts: { 'opt-1a': 1200, 'opt-1b': 800 } },
      { ageGroup: '20s', label: '20대', counts: { 'opt-1a': 2500, 'opt-1b': 2800 } },
      { ageGroup: '30s', label: '30대', counts: { 'opt-1a': 2200, 'opt-1b': 2100 } },
      { ageGroup: '40s', label: '40대', counts: { 'opt-1a': 1500, 'opt-1b': 1200 } },
      { ageGroup: '50s', label: '50대', counts: { 'opt-1a': 600, 'opt-1b': 500 } },
      { ageGroup: '60s+', label: '60대+', counts: { 'opt-1a': 234, 'opt-1b': 148 } },
    ],
    region: [
      { region: '서울', counts: { 'opt-1a': 2800, 'opt-1b': 2500 } },
      { region: '경기', counts: { 'opt-1a': 2200, 'opt-1b': 2000 } },
      { region: '부산', counts: { 'opt-1a': 800, 'opt-1b': 900 } },
      { region: '대구', counts: { 'opt-1a': 600, 'opt-1b': 500 } },
      { region: '인천', counts: { 'opt-1a': 700, 'opt-1b': 600 } },
      { region: '기타', counts: { 'opt-1a': 1134, 'opt-1b': 1048 } },
    ],
  },
  'poll-2': {
    gender: [
      { gender: 'male', label: '남성', counts: { 'opt-2a': 6500, 'opt-2b': 5200 } },
      { gender: 'female', label: '여성', counts: { 'opt-2a': 4734, 'opt-2b': 7022 } },
    ],
    age: [
      { ageGroup: '10s', label: '10대', counts: { 'opt-2a': 1500, 'opt-2b': 2200 } },
      { ageGroup: '20s', label: '20대', counts: { 'opt-2a': 3200, 'opt-2b': 4100 } },
      { ageGroup: '30s', label: '30대', counts: { 'opt-2a': 3000, 'opt-2b': 2800 } },
      { ageGroup: '40s', label: '40대', counts: { 'opt-2a': 2000, 'opt-2b': 1800 } },
      { ageGroup: '50s', label: '50대', counts: { 'opt-2a': 1000, 'opt-2b': 900 } },
      { ageGroup: '60s+', label: '60대+', counts: { 'opt-2a': 534, 'opt-2b': 422 } },
    ],
    region: [
      { region: '서울', counts: { 'opt-2a': 3000, 'opt-2b': 3500 } },
      { region: '경기', counts: { 'opt-2a': 2500, 'opt-2b': 2800 } },
      { region: '강원', counts: { 'opt-2a': 1800, 'opt-2b': 500 } },
      { region: '부산', counts: { 'opt-2a': 600, 'opt-2b': 2200 } },
      { region: '제주', counts: { 'opt-2a': 400, 'opt-2b': 1500 } },
      { region: '기타', counts: { 'opt-2a': 2934, 'opt-2b': 1722 } },
    ],
  },
};

// ---- 어그로성 카피 목록 ----
export const AGGRO_COPIES = [
  '아직도 탕수육 부먹하는 사람이 있습니까? (충격 실화)',
  '손흥민 vs 박지성, 이거 유령도 로그인해서 투표하고 간다며?',
  '민초파는 조용히 나가주세요... 가 아니라 투표로 이겨라!',
  '짜장면이냐 짬뽕이냐, 그것이 문제로다 🤔',
  '고양이 vs 강아지... 이 싸움은 절대 안 끝납니다',
  '여름파 vs 겨울파, 에어컨 틀지 히터 틀지 투표로 결정!',
  '아이폰 vs 갤럭시, 댓글 전쟁 예약 완료 🔥',
  '당신의 한 표가 인터넷 논쟁의 역사를 바꿉니다!',
];

// ---- 카테고리 목록 ----
export const CATEGORIES = ['전체', '음식', '라이프', '스포츠', 'IT/기술', '연예', '기타'];

// ---- 지역 목록 ----
export const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주',
  '대전', '울산', '세종', '강원', '충북', '충남',
  '전북', '전남', '경북', '경남', '제주',
];

import { getUserPolls } from './store';
import { canUseSupabase, dbFetchPolls, dbFetchPollById, dbFetchComments, dbGetPollStats, dbUpdatePoll, dbDeletePoll } from './supabase-db';

// ---- Poll ID로 검색 (동기 — 로컬/더미 폴백) ----
export function getPollById(id: string): Poll | undefined {
  const userPolls = getUserPolls();
  return userPolls.find((p) => p.id === id) || DUMMY_POLLS.find((p) => p.id === id);
}

// ---- Poll 통계 (동기 — 더미 폴백) ----
export function getPollStats(pollId: string): PollStats | undefined {
  return DUMMY_STATS[pollId];
}

// ---- Poll 댓글 (동기 — 더미 폴백) ----
export function getPollComments(pollId: string): Comment[] {
  return DUMMY_COMMENTS[pollId] || [];
}

// ============================================================
// Supabase 비동기 함수 (DB 우선, 실패 시 더미 폴백)
// ============================================================

/** 전체 투표 목록 조회 (DB → 더미 폴백) */
export async function fetchAllPolls(): Promise<Poll[]> {
  if (canUseSupabase()) {
    try {
      const dbPolls = await dbFetchPolls();
      if (dbPolls.length > 0) {
        return dbPolls;
      }
    } catch (err) {
      console.warn('[Supabase] Polls 조회 실패, 더미 데이터 사용:', err);
    }
  }

  // 폴백: 로컬 유저 투표 + 더미 데이터
  const userPolls = getUserPolls();
  return [...userPolls, ...DUMMY_POLLS];
}

/** 단일 투표 조회 (DB → 더미 폴백) */
export async function fetchPollById(id: string): Promise<Poll | undefined> {
  if (canUseSupabase()) {
    try {
      const dbPoll = await dbFetchPollById(id);
      if (dbPoll) return dbPoll;
    } catch (err) {
      console.warn('[Supabase] Poll 조회 실패, 로컬 데이터 사용:', err);
    }
  }
  return getPollById(id);
}

/** 댓글 조회 (DB → 더미 폴백) */
export async function fetchPollComments(pollId: string): Promise<Comment[]> {
  if (canUseSupabase()) {
    try {
      const dbComments = await dbFetchComments(pollId);
      if (dbComments.length > 0) return dbComments;
    } catch (err) {
      console.warn('[Supabase] Comments 조회 실패, 더미 데이터 사용:', err);
    }
  }
  return getPollComments(pollId);
}

/** 통계 조회 (DB → 더미 폴백) */
export async function fetchPollStats(pollId: string): Promise<PollStats | undefined> {
  if (canUseSupabase()) {
    try {
      const dbStats = await dbGetPollStats(pollId);
      if (dbStats) return dbStats;
    } catch (err) {
      console.warn('[Supabase] Stats 조회 실패, 더미 데이터 사용:', err);
    }
  }
  return getPollStats(pollId);
}

/** 투표 수정 (DB 우선, 실패 시 에러 반환) */
export async function updatePoll(
  pollId: string,
  pollData: Partial<Omit<Poll, 'id' | 'totalVotes' | 'createdAt' | 'createdBy'>>,
  optionsData: { id: string; label: string; imageUrl?: string; emoji?: string }[]
): Promise<{ success: boolean; error?: string }> {
  if (canUseSupabase()) {
    return dbUpdatePoll(pollId, pollData, optionsData);
  }
  return { success: false, error: '데이터베이스에 연결할 수 없습니다.' };
}

/** 투표 삭제 (DB 우선, 실패 시 에러 반환) */
export async function deletePoll(pollId: string): Promise<{ success: boolean; error?: string }> {
  if (canUseSupabase()) {
    return dbDeletePoll(pollId);
  }
  return { success: false, error: '데이터베이스에 연결할 수 없습니다.' };
}
