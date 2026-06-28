// ============================================================
// 방구석 백분토론 — Supabase DB CRUD 함수
// ============================================================
// localStorage 폴백 지원: Supabase 연결 실패 시 기존 방식으로 동작
// ============================================================

import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { User, Poll, PollOption, Vote, Comment, PollStats } from './types';

// ============================================================
// 유틸리티
// ============================================================

/** Supabase 사용 가능 여부 (클라이언트 사이드 + 환경 변수 설정됨) */
export function canUseSupabase(): boolean {
  if (typeof window === 'undefined') return false;
  return isSupabaseConfigured();
}

// ============================================================
// Users
// ============================================================

/** 회원가입 — Supabase에 유저 생성 */
export async function dbCreateUser(user: User): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  // 아이디 중복 체크
  if (user.loginId) {
    const { data: existingId } = await client
      .from('users')
      .select('id')
      .eq('login_id', user.loginId)
      .maybeSingle();

    if (existingId) {
      return { success: false, error: '이미 사용 중인 아이디입니다.' };
    }
  }

  // 닉네임 중복 체크
  const { data: existing } = await client
    .from('users')
    .select('id')
    .eq('nickname', user.nickname)
    .maybeSingle();

  if (existing) {
    return { success: false, error: '이미 사용 중인 닉네임입니다.' };
  }

  const { error } = await client.from('users').insert({
    id: user.id,
    nickname: user.nickname,
    gender: user.gender,
    birth_year: user.birthYear,
    region: user.region,
    created_at: user.createdAt,
    login_id: user.loginId || null,
    password: user.password || null,
  });

  if (error) {
    console.error('[Supabase] User 생성 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** 유저 ID로 조회 */
export async function dbGetUserById(id: string): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    nickname: data.nickname,
    gender: data.gender,
    birthYear: data.birth_year,
    region: data.region,
    createdAt: data.created_at,
    loginId: data.login_id || undefined,
    password: data.password || undefined,
  };
}

/** 로그인 — Supabase에서 아이디/비번으로 유저 조회 */
export async function dbLoginUser(loginId: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('login_id', loginId)
    .eq('password', password)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] 로그인 조회 실패:', error.message);
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
  }

  const user: User = {
    id: data.id,
    nickname: data.nickname,
    gender: data.gender,
    birthYear: data.birth_year,
    region: data.region,
    createdAt: data.created_at,
    loginId: data.login_id || undefined,
    password: data.password || undefined,
  };

  return { success: true, user };
}

/** 아이디 중복 검사 */
export async function dbCheckLoginIdDuplicate(loginId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const { data } = await client
    .from('users')
    .select('id')
    .eq('login_id', loginId)
    .maybeSingle();

  return !!data;
}

/** 회원 탈퇴 — Supabase에서 유저 제거 */
export async function dbDeleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  const { error } = await client
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] 유저 삭제 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Polls
// ============================================================

/** 투표 목록 조회 (옵션 + 투표 수 포함) */
export async function dbFetchPolls(): Promise<Poll[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data: polls, error } = await client
    .from('polls')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !polls) {
    console.error('[Supabase] Polls 조회 실패:', error?.message);
    return [];
  }

  const result: Poll[] = [];

  for (const poll of polls) {
    let options: PollOption[] = [];
    try {
      const { data: optionCounts, error: viewError } = await client
        .from('poll_option_counts')
        .select('*')
        .eq('poll_id', poll.id);

      if (!viewError && optionCounts && optionCounts.length > 0) {
        options = optionCounts.map((oc) => ({
          id: oc.option_id,
          pollId: oc.poll_id,
          label: oc.label,
          imageUrl: oc.image_url || undefined,
          emoji: oc.emoji || undefined,
          voteCount: Number(oc.vote_count) || 0,
        }));
      } else {
        throw new Error('View fallback');
      }
    } catch (err) {
      // raw 테이블 폴백
      const { data: rawOptions } = await client
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('id', { ascending: true });

      if (rawOptions) {
        options = await Promise.all(
          rawOptions.map(async (ro) => {
            const { count } = await client
              .from('votes')
              .select('*', { count: 'exact', head: true })
              .eq('poll_id', poll.id)
              .eq('option_id', ro.id);

            return {
              id: ro.id,
              pollId: ro.poll_id,
              label: ro.label,
              imageUrl: ro.image_url || undefined,
              emoji: ro.emoji || undefined,
              voteCount: count || 0,
            };
          })
        );
      }
    }

    let totalVotes = 0;
    try {
      const { data: totalData, error: viewError } = await client
        .from('poll_total_votes')
        .select('total_votes')
        .eq('poll_id', poll.id)
        .maybeSingle();

      if (!viewError && totalData) {
        totalVotes = Number(totalData.total_votes) || 0;
      } else {
        throw new Error('View fallback');
      }
    } catch (err) {
      const { count } = await client
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('poll_id', poll.id);
      totalVotes = count || 0;
    }

    result.push({
      id: poll.id,
      title: poll.title,
      description: poll.description || undefined,
      status: poll.status,
      thumbnailUrl: poll.thumbnail_url || undefined,
      category: poll.category,
      options,
      totalVotes,
      createdAt: poll.created_at,
      createdBy: poll.created_by || undefined,
    });
  }

  return result;
}

/** 단일 투표 조회 */
export async function dbFetchPollById(id: string): Promise<Poll | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  // 1. 투표 기본 정보 조회
  const { data: poll, error } = await client
    .from('polls')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !poll) return null;

  // 2. 옵션 정보 조회 (뷰 조회를 먼저 시도하되, 실패 시 raw 테이블에서 조회)
  let options: PollOption[] = [];
  try {
    const { data: optionCounts, error: viewError } = await client
      .from('poll_option_counts')
      .select('*')
      .eq('poll_id', id)
      .order('id', { ascending: true });

    if (!viewError && optionCounts && optionCounts.length > 0) {
      options = optionCounts.map((oc) => ({
        id: oc.option_id,
        pollId: oc.poll_id,
        label: oc.label,
        imageUrl: oc.image_url || undefined,
        emoji: oc.emoji || undefined,
        voteCount: Number(oc.vote_count) || 0,
      }));
    } else {
      throw new Error('View fallback');
    }
  } catch (err) {
    // raw poll_options 테이블에서 조회
    const { data: rawOptions } = await client
      .from('poll_options')
      .select('*')
      .eq('poll_id', id)
      .order('id', { ascending: true });

    if (rawOptions) {
      options = await Promise.all(
        rawOptions.map(async (ro) => {
          const { count } = await client
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('poll_id', id)
            .eq('option_id', ro.id);

          return {
            id: ro.id,
            pollId: ro.poll_id,
            label: ro.label,
            imageUrl: ro.image_url || undefined,
            emoji: ro.emoji || undefined,
            voteCount: count || 0,
          };
        })
      );
    }
  }

  // 3. 총 투표 수 계산
  let totalVotes = 0;
  try {
    const { data: totalData, error: viewError } = await client
      .from('poll_total_votes')
      .select('total_votes')
      .eq('poll_id', id)
      .maybeSingle();

    if (!viewError && totalData) {
      totalVotes = Number(totalData.total_votes) || 0;
    } else {
      throw new Error('View fallback');
    }
  } catch (err) {
    const { count } = await client
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('poll_id', id);
    totalVotes = count || 0;
  }

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description || undefined,
    status: poll.status,
    thumbnailUrl: poll.thumbnail_url || undefined,
    category: poll.category,
    options,
    totalVotes,
    createdAt: poll.created_at,
    createdBy: poll.created_by || undefined,
  };
}

/** 투표 개설 */
export async function dbCreatePoll(
  poll: Omit<Poll, 'totalVotes'>,
  optionsData: { id: string; label: string; imageUrl?: string; emoji?: string }[]
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  // polls 테이블에 INSERT
  const { error: pollError } = await client.from('polls').insert({
    id: poll.id,
    title: poll.title,
    description: poll.description || null,
    status: poll.status,
    thumbnail_url: poll.thumbnailUrl || null,
    category: poll.category,
    created_by: poll.createdBy || null,
    created_at: poll.createdAt,
  });

  if (pollError) {
    console.error('[Supabase] Poll 생성 실패:', pollError.message);
    return { success: false, error: pollError.message };
  }

  // poll_options 테이블에 INSERT
  const optionRows = optionsData.map((opt) => ({
    id: opt.id,
    poll_id: poll.id,
    label: opt.label,
    image_url: opt.imageUrl || null,
    emoji: opt.emoji || null,
  }));

  const { error: optError } = await client.from('poll_options').insert(optionRows);

  if (optError) {
    console.error('[Supabase] Options 생성 실패:', optError.message);
    return { success: false, error: optError.message };
  }

  return { success: true };
}

/** 투표 수정 */
export async function dbUpdatePoll(
  pollId: string,
  pollData: Partial<Omit<Poll, 'id' | 'totalVotes' | 'createdAt' | 'createdBy'>>,
  optionsData?: { id: string; label: string; imageUrl?: string; emoji?: string }[]
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  // 1. Update polls table
  const updateData: any = {};
  if (pollData.title !== undefined) updateData.title = pollData.title;
  if (pollData.description !== undefined) updateData.description = pollData.description || null;
  if (pollData.thumbnailUrl !== undefined) updateData.thumbnail_url = pollData.thumbnailUrl || null;
  if (pollData.category !== undefined) updateData.category = pollData.category;
  if (pollData.status !== undefined) updateData.status = pollData.status;

  if (Object.keys(updateData).length > 0) {
    const { error: pollError } = await client.from('polls').update(updateData).eq('id', pollId);
    if (pollError) {
      console.error('[Supabase] Poll 수정 실패:', pollError.message);
      return { success: false, error: pollError.message };
    }
  }

  // 2. Handle options (Upsert & Delete) ONLY IF optionsData is provided
  if (optionsData) {
    const optionIdsToKeep = optionsData.map(o => o.id);

    // Delete removed options
    const { error: deleteError } = await client
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId)
      .not('id', 'in', `(${optionIdsToKeep.join(',')})`);

    if (deleteError) {
      console.error('[Supabase] 기존 Options 삭제 실패:', deleteError.message);
    }

    // Upsert current options
    const optionRows = optionsData.map((opt) => ({
      id: opt.id,
      poll_id: pollId,
      label: opt.label,
      image_url: opt.imageUrl || null,
      emoji: opt.emoji || null,
    }));

    const { error: upsertError } = await client.from('poll_options').upsert(optionRows);

    if (upsertError) {
      console.error('[Supabase] Options 업데이트 실패:', upsertError.message);
      return { success: false, error: upsertError.message };
    }
  }

  return { success: true };
}

/** 투표 삭제 */
export async function dbDeletePoll(pollId: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  const { error } = await client.from('polls').delete().eq('id', pollId);
  if (error) {
    console.error('[Supabase] Poll 삭제 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Votes
// ============================================================

/** 투표 기록 저장 */
export async function dbCastVote(vote: Vote): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  // 해당 투표에서 사용자가 몇 표를 사용했는지 확인
  const { data: existingVotes } = await client
    .from('votes')
    .select('id')
    .eq('poll_id', vote.pollId)
    .eq('user_id', vote.userId);

  if (existingVotes && existingVotes.length >= 3) {
    return { success: false, error: '최대 3표까지 가능합니다.' };
  }

  const { error } = await client.from('votes').insert({
    id: vote.id,
    poll_id: vote.pollId,
    option_id: vote.optionId,
    user_id: vote.userId,
    gender: vote.gender || null,
    age_group: vote.ageGroup || null,
    region: vote.region || null,
    created_at: vote.createdAt,
  });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '이미 투표한 옵션입니다.' };
    }
    console.error('[Supabase] Vote 저장 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** 투표 취소 */
export async function dbCancelVotes(pollId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  const { error } = await client
    .from('votes')
    .delete()
    .eq('poll_id', pollId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Supabase] Vote 취소 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** 사용자가 특정 투표에서 투표한 옵션 목록 */
export async function dbGetVotedOptions(pollId: string, userId: string): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('votes')
    .select('option_id')
    .eq('poll_id', pollId)
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((v) => v.option_id);
}

// ============================================================
// Comments
// ============================================================

/** 댓글 목록 조회 */
export async function dbFetchComments(pollId: string): Promise<Comment[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('comments')
    .select('*')
    .eq('poll_id', pollId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    pollId: c.poll_id,
    userId: c.user_id,
    nickname: c.nickname,
    optionId: c.option_id,
    optionLabel: c.option_label,
    content: c.content,
    likes: c.likes || 0,
    dislikes: c.dislikes || 0,
    createdAt: c.created_at,
    isBest: c.is_best || false,
    parentId: c.parent_id || undefined,
  }));
}

/** 댓글 작성 */
export async function dbCreateComment(comment: Comment): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  // user_id FK 위반 방지: users 테이블에 해당 유저가 없으면 먼저 생성
  const { data: existingUser } = await client
    .from('users')
    .select('id')
    .eq('id', comment.userId)
    .maybeSingle();

  if (!existingUser) {
    // 게스트 또는 로컬 유저 — DB에 등록
    await client.from('users').insert({
      id: comment.userId,
      nickname: comment.nickname,
      gender: 'other',
      birth_year: 2000,
      region: '미가입자',
      created_at: new Date().toISOString(),
    }).maybeSingle(); // 이미 있으면 무시 (에러 무시)
  }

  const insertData: Record<string, unknown> = {
    id: comment.id,
    poll_id: comment.pollId,
    user_id: comment.userId,
    nickname: comment.nickname,
    option_id: comment.optionId,
    option_label: comment.optionLabel,
    content: comment.content,
    likes: 0,
    dislikes: 0,
    is_best: false,
    created_at: comment.createdAt,
  };

  // parent_id는 컬럼이 있을 때만 포함
  if (comment.parentId) {
    insertData.parent_id = comment.parentId;
  }

  const { error } = await client.from('comments').insert(insertData);

  if (error) {
    console.error('[Supabase] Comment 생성 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** 댓글 좋아요 */
export async function dbLikeComment(commentId: string, _userId?: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  // RPC 없이 간단하게 현재 값 조회 후 +1
  const { data } = await client
    .from('comments')
    .select('likes')
    .eq('id', commentId)
    .maybeSingle();

  if (data) {
    await client
      .from('comments')
      .update({ likes: (data.likes || 0) + 1 })
      .eq('id', commentId);
  }
}

/** 댓글 싫어요 */
export async function dbDislikeComment(commentId: string, _userId?: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { data } = await client
    .from('comments')
    .select('dislikes')
    .eq('id', commentId)
    .maybeSingle();

  if (data) {
    await client
      .from('comments')
      .update({ dislikes: (data.dislikes || 0) + 1 })
      .eq('id', commentId);
  }
}

// ============================================================
// Comment Votes (추천/비추천 토글 — 크로스 디바이스 동기화)
// ============================================================

/**
 * 해당 유저의 모든 댓글 투표 이력을 DB에서 조회
 * 로그인 후 마운트 시 호출해 localStorage 캐시와 동기화
 */
export async function dbGetMyCommentVotes(
  userId: string
): Promise<Record<string, 'like' | 'dislike'>> {
  const client = getSupabaseClient();
  if (!client) return {};

  const { data, error } = await client
    .from('comment_votes')
    .select('comment_id, vote_type')
    .eq('user_id', userId);

  if (error || !data) return {};

  const result: Record<string, 'like' | 'dislike'> = {};
  for (const row of data) {
    result[row.comment_id] = row.vote_type as 'like' | 'dislike';
  }
  return result;
}

/**
 * 댓글 추천/비추천 토글
 * - 같은 타입이 이미 있으면 → 취소 (DELETE + count -1)
 * - 없으면 → 추가 (INSERT + count +1)
 * @returns 'added' | 'removed'
 */
export async function dbToggleCommentVote(
  commentId: string,
  userId: string,
  type: 'like' | 'dislike'
): Promise<'added' | 'removed'> {
  const client = getSupabaseClient();
  if (!client) return 'added';

  // 기존 투표 조회
  const { data: existing } = await client
    .from('comment_votes')
    .select('id, vote_type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // 같은 타입 → 취소
    await client
      .from('comment_votes')
      .delete()
      .eq('id', existing.id);

    // comments 카운트 -1 (최솟값 0 보정)
    const countCol = type === 'like' ? 'likes' : 'dislikes';
    const { data: cur } = await client
      .from('comments')
      .select(countCol)
      .eq('id', commentId)
      .maybeSingle();

    if (cur) {
      const current = (cur as Record<string, number>)[countCol] || 0;
      await client
        .from('comments')
        .update({ [countCol]: Math.max(0, current - 1) })
        .eq('id', commentId);
    }

    return 'removed';
  } else {
    // 투표 없음 → 추가
    await client
      .from('comment_votes')
      .insert({ comment_id: commentId, user_id: userId, vote_type: type });

    const countCol = type === 'like' ? 'likes' : 'dislikes';
    const { data: cur } = await client
      .from('comments')
      .select(countCol)
      .eq('id', commentId)
      .maybeSingle();

    if (cur) {
      const current = (cur as Record<string, number>)[countCol] || 0;
      await client
        .from('comments')
        .update({ [countCol]: current + 1 })
        .eq('id', commentId);
    }

    return 'added';
  }
}


// ============================================================
// Statistics (통계)
// ============================================================

/** 투표 통계 조회 (성별/연령/지역별) */
export async function dbGetPollStats(pollId: string): Promise<PollStats | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: votes, error } = await client
    .from('votes')
    .select('option_id, gender, age_group, region')
    .eq('poll_id', pollId);

  if (error || !votes || votes.length === 0) return null;

  // 성별 통계
  const genderMap: Record<string, Record<string, number>> = {};
  const ageMap: Record<string, Record<string, number>> = {};
  const regionMap: Record<string, Record<string, number>> = {};

  for (const v of votes) {
    const optId = v.option_id;

    // 성별
    if (v.gender) {
      if (!genderMap[v.gender]) genderMap[v.gender] = {};
      genderMap[v.gender][optId] = (genderMap[v.gender][optId] || 0) + 1;
    }

    // 연령
    if (v.age_group) {
      if (!ageMap[v.age_group]) ageMap[v.age_group] = {};
      ageMap[v.age_group][optId] = (ageMap[v.age_group][optId] || 0) + 1;
    }

    // 지역
    if (v.region) {
      if (!regionMap[v.region]) regionMap[v.region] = {};
      regionMap[v.region][optId] = (regionMap[v.region][optId] || 0) + 1;
    }
  }

  const genderLabels: Record<string, string> = { male: '남성', female: '여성', other: '기타' };
  const ageLabels: Record<string, string> = {
    '10s': '10대', '20s': '20대', '30s': '30대',
    '40s': '40대', '50s': '50대', '60s+': '60대+',
  };

  return {
    gender: Object.entries(genderMap).map(([g, counts]) => ({
      gender: g,
      label: genderLabels[g] || g,
      counts,
    })),
    age: Object.entries(ageMap).map(([ag, counts]) => ({
      ageGroup: ag,
      label: ageLabels[ag] || ag,
      counts,
    })),
    region: Object.entries(regionMap).map(([r, counts]) => ({
      region: r,
      counts,
    })),
  };
}

// ============================================================
// Free Opinions (자유 한줄 의견)
// ============================================================

/** 한줄 의견 목록 조회 (최신순) */
export async function dbFetchOpinions(): Promise<{ id: string; name: string; content: string; color: 'blue' | 'orange' | 'green' | 'purple'; emoji: string; likes: number; createdAt: string }[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('free_opinions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[Supabase] Opinions 조회 실패:', error?.message);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    content: d.content,
    color: d.color as 'blue' | 'orange' | 'green' | 'purple',
    emoji: d.emoji,
    likes: d.likes || 0,
    createdAt: d.created_at,
  }));
}

/** 한줄 의견 생성 */
export async function dbCreateOpinion(opinion: {
  id: string;
  name: string;
  content: string;
  color: string;
  emoji: string;
  likes: number;
  createdAt: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  const { error } = await client.from('free_opinions').insert({
    id: opinion.id,
    name: opinion.name,
    content: opinion.content,
    color: opinion.color,
    emoji: opinion.emoji,
    likes: opinion.likes,
    created_at: opinion.createdAt,
  });

  if (error) {
    console.error('[Supabase] Opinion 생성 실패:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** 한줄 의견 좋아요 수 증가/감소 */
export async function dbLikeOpinion(opinionId: string, increment: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { data } = await client
    .from('free_opinions')
    .select('likes')
    .eq('id', opinionId)
    .maybeSingle();

  if (data) {
    const diff = increment ? 1 : -1;
    await client
      .from('free_opinions')
      .update({ likes: Math.max(0, (data.likes || 0) + diff) })
      .eq('id', opinionId);
  }
}

