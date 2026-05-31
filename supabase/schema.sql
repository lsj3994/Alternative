-- ============================================================
-- 방구석 백분토론 — Supabase DB 스키마
-- ============================================================
-- Supabase Dashboard > SQL Editor 에서 이 SQL을 실행하세요.
-- ============================================================

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  birth_year INTEGER NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  login_id TEXT UNIQUE,
  password TEXT
);

-- 2. polls 테이블
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT '기타',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. poll_options 테이블
CREATE TABLE IF NOT EXISTS poll_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  image_url TEXT,
  emoji TEXT
);

-- 4. votes 테이블
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  gender TEXT,
  age_group TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- 동일 옵션에 여러 표를 행사할 수 있도록 UNIQUE 제약 조건을 제거했습니다.
);

-- 5. comments 테이블
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  nickname TEXT NOT NULL,
  option_id TEXT NOT NULL,
  option_label TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  is_best BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE
);

-- 6. comment_votes 테이블 (추천/비추천 토글 — 크로스 디바이스 동기화)
CREATE TABLE IF NOT EXISTS comment_votes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id  TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (comment_id, user_id)   -- 1인 1댓글 1표
);

-- ============================================================
-- 인덱스 (성능 최적화)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_comments_poll_id ON comments(poll_id);

-- ============================================================
-- 투표 수 집계 뷰 (옵션별 투표 수)
-- ============================================================
CREATE OR REPLACE VIEW poll_option_counts AS
SELECT
  po.id AS option_id,
  po.poll_id,
  po.label,
  po.image_url,
  po.emoji,
  COALESCE(COUNT(v.id), 0) AS vote_count
FROM poll_options po
LEFT JOIN votes v ON v.option_id = po.id
GROUP BY po.id, po.poll_id, po.label, po.image_url, po.emoji;

-- ============================================================
-- 투표 총 참여 수 뷰
-- ============================================================
CREATE OR REPLACE VIEW poll_total_votes AS
SELECT
  p.id AS poll_id,
  COALESCE(COUNT(v.id), 0) AS total_votes
FROM polls p
LEFT JOIN votes v ON v.poll_id = p.id
GROUP BY p.id;

-- ============================================================
-- Row Level Security (RLS) 설정
-- 모든 사람이 읽을 수 있고, 인증된 사용자만 쓸 수 있도록
-- ============================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 읽기: 모두 허용
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Public read poll_options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);

-- 쓰기: anon 키로도 INSERT 허용 (현재 Supabase Auth 미사용이므로)
CREATE POLICY "Allow insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert polls" ON polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert poll_options" ON poll_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert comments" ON comments FOR INSERT WITH CHECK (true);

-- 수정: 댓글 좋아요/싫어요 업데이트 허용
CREATE POLICY "Allow update comments" ON comments FOR UPDATE USING (true);
-- 투표 상태 변경 허용
CREATE POLICY "Allow update polls" ON polls FOR UPDATE USING (true);
