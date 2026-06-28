import { Poll } from './types';

/**
 * 투표 개설 후 7일이 지났는지 여부를 반환합니다.
 */
export function isPollExpired(createdAt: string): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  return diffTime > oneWeekMs;
}

/**
 * 투표가 활성 상태(진행중)인지 확인합니다.
 * status가 'active'이고, 개설된 지 7일이 지나지 않았어야 합니다.
 */
export function isPollActive(poll: Poll): boolean {
  if (poll.status !== 'active') return false;
  return !isPollExpired(poll.createdAt);
}

/**
 * 남은 기한 또는 마감 결과를 가독성 있는 한글 텍스트로 반환합니다.
 */
export function getRemainingTimeText(createdAt: string, status: 'active' | 'closed'): string {
  if (status === 'closed') {
    return '마감됨';
  }

  const createdDate = new Date(createdAt);
  const deadline = createdDate.getTime() + 7 * 24 * 60 * 60 * 1000;
  const diffTime = deadline - Date.now();

  if (diffTime <= 0) {
    return '기간 만료됨';
  }

  const days = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diffTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diffTime % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `마감까지 ${days}일 ${hours}시간 남음`;
  }
  if (hours > 0) {
    return `마감까지 ${hours}시간 ${minutes}분 남음`;
  }
  return `마감까지 ${minutes}분 남음`;
}
