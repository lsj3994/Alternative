// ============================================================
// 방구석 백분토론 — TypeScript 타입 정의
// ============================================================

export interface User {
  id: string;
  nickname: string;
  gender: 'male' | 'female' | 'other';
  birthYear: number;
  region: string;
  createdAt: string;
  loginId?: string;
  password?: string;
}

export interface Demographics {
  gender: 'male' | 'female' | 'other';
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
  region: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  label: string;
  imageUrl?: string;
  emoji?: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'closed';
  thumbnailUrl?: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  createdBy?: string;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  gender?: string;
  ageGroup?: string;
  region?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  pollId: string;
  userId: string;
  nickname: string;
  optionId: string;
  optionLabel: string;
  content: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  isBest?: boolean;
  parentId?: string;
}

// 통계 데이터 타입
export interface GenderStat {
  gender: string;
  label: string;
  counts: Record<string, number>; // optionId -> count
}

export interface AgeStat {
  ageGroup: string;
  label: string;
  counts: Record<string, number>;
}

export interface RegionStat {
  region: string;
  counts: Record<string, number>;
}

export interface PollStats {
  gender: GenderStat[];
  age: AgeStat[];
  region: RegionStat[];
}

// 투표 개설 폼 타입
export interface CreatePollInput {
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  options: {
    label: string;
    imageUrl?: string;
  }[];
}
