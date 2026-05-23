// ============================================================
// 방구석 백분토론 — AI 이미지 생성 함수 (분리 구조)
// ============================================================
// 한국어 선택지 텍스트를 분석하여 관련성 있는 이미지를 생성합니다.
// 이모지 + 그라디언트 배경으로 항상 선택지와 연관된 이미지를 만듭니다.
// ============================================================

/**
 * 한국어 키워드 → 이모지 + 영문 키워드 매핑
 */
interface KeywordMapping {
  emoji: string;
  label: string;
  gradient: [string, string]; // 그라디언트 색상 [from, to]
}

const KEYWORD_MAP: Record<string, KeywordMapping> = {
  // 음식
  '짜장면': { emoji: '🍜', label: '짜장면', gradient: ['#1a1a2e', '#4a3728'] },
  '짬뽕': { emoji: '🌶️', label: '짬뽕', gradient: ['#c0392b', '#e74c3c'] },
  '피자': { emoji: '🍕', label: 'Pizza', gradient: ['#e67e22', '#f39c12'] },
  '치킨': { emoji: '🍗', label: 'Chicken', gradient: ['#d4a017', '#f0c040'] },
  '커피': { emoji: '☕', label: 'Coffee', gradient: ['#3e2723', '#795548'] },
  '차': { emoji: '🍵', label: 'Tea', gradient: ['#2e7d32', '#66bb6a'] },
  '햄버거': { emoji: '🍔', label: 'Burger', gradient: ['#c0392b', '#e67e22'] },
  '라면': { emoji: '🍜', label: '라면', gradient: ['#d32f2f', '#ff7043'] },
  '떡볶이': { emoji: '🫕', label: '떡볶이', gradient: ['#c62828', '#ef5350'] },
  '김밥': { emoji: '🍙', label: '김밥', gradient: ['#33691e', '#7cb342'] },
  '초밥': { emoji: '🍣', label: 'Sushi', gradient: ['#e65100', '#ff9800'] },
  '고기': { emoji: '🥩', label: 'Meat', gradient: ['#8d2222', '#c0392b'] },
  '삼겹살': { emoji: '🥓', label: '삼겹살', gradient: ['#a1532e', '#d4764e'] },
  '국밥': { emoji: '🍲', label: '국밥', gradient: ['#f5f0e6', '#c8a96e'] },
  '탕수육': { emoji: '🥟', label: '탕수육', gradient: ['#e67e22', '#f1c40f'] },
  '부먹': { emoji: '🫗', label: '부먹', gradient: ['#e67e22', '#f39c12'] },
  '찍먹': { emoji: '🥢', label: '찍먹', gradient: ['#d35400', '#e74c3c'] },
  '밥': { emoji: '🍚', label: 'Rice', gradient: ['#f5f5f5', '#e0e0e0'] },
  '빵': { emoji: '🍞', label: 'Bread', gradient: ['#d4a15a', '#e8c07a'] },
  '과일': { emoji: '🍎', label: 'Fruit', gradient: ['#c0392b', '#27ae60'] },
  '아이스크림': { emoji: '🍦', label: 'Ice Cream', gradient: ['#f8bbd0', '#f48fb1'] },
  '케이크': { emoji: '🎂', label: 'Cake', gradient: ['#f06292', '#ec407a'] },
  '초콜릿': { emoji: '🍫', label: 'Chocolate', gradient: ['#4e342e', '#795548'] },
  '사탕': { emoji: '🍬', label: 'Candy', gradient: ['#e91e63', '#f06292'] },
  '민초': { emoji: '🍫', label: '민트초코', gradient: ['#00bfa5', '#4dd0e1'] },
  '반민초': { emoji: '🚫', label: '반민초', gradient: ['#d32f2f', '#ef5350'] },
  '민트초코': { emoji: '🍫', label: '민트초코', gradient: ['#00bfa5', '#4dd0e1'] },
  '콜라': { emoji: '🥤', label: 'Cola', gradient: ['#b71c1c', '#d32f2f'] },
  '사이다': { emoji: '🥤', label: 'Cider', gradient: ['#00c853', '#69f0ae'] },
  '맥주': { emoji: '🍺', label: 'Beer', gradient: ['#f9a825', '#fdd835'] },
  '소주': { emoji: '🍶', label: '소주', gradient: ['#26c6da', '#80deea'] },
  '와인': { emoji: '🍷', label: 'Wine', gradient: ['#6a1b9a', '#9c27b0'] },

  // 자연/계절
  '산': { emoji: '🏔️', label: 'Mountain', gradient: ['#2e7d32', '#1b5e20'] },
  '바다': { emoji: '🌊', label: 'Ocean', gradient: ['#0277bd', '#4fc3f7'] },
  '여름': { emoji: '☀️', label: 'Summer', gradient: ['#ff6f00', '#ffa726'] },
  '겨울': { emoji: '❄️', label: 'Winter', gradient: ['#4a6fa5', '#93b5e1'] },
  '봄': { emoji: '🌸', label: 'Spring', gradient: ['#f48fb1', '#f8bbd0'] },
  '가을': { emoji: '🍂', label: 'Autumn', gradient: ['#e65100', '#ff9800'] },
  '비': { emoji: '🌧️', label: 'Rain', gradient: ['#546e7a', '#78909c'] },
  '눈': { emoji: '⛄', label: 'Snow', gradient: ['#b3e5fc', '#e1f5fe'] },

  // 동물
  '고양이': { emoji: '🐱', label: 'Cat', gradient: ['#ff8a65', '#ffab91'] },
  '강아지': { emoji: '🐶', label: 'Dog', gradient: ['#8d6e63', '#bcaaa4'] },
  '새': { emoji: '🐦', label: 'Bird', gradient: ['#42a5f5', '#90caf9'] },
  '물고기': { emoji: '🐟', label: 'Fish', gradient: ['#0288d1', '#4fc3f7'] },
  '토끼': { emoji: '🐰', label: 'Rabbit', gradient: ['#f8bbd0', '#fce4ec'] },
  '곰': { emoji: '🐻', label: 'Bear', gradient: ['#6d4c41', '#8d6e63'] },
  '호랑이': { emoji: '🐯', label: 'Tiger', gradient: ['#e65100', '#ff9800'] },
  '사자': { emoji: '🦁', label: 'Lion', gradient: ['#f9a825', '#fdd835'] },

  // 스포츠/인물
  '손흥민': { emoji: '⚽', label: '손흥민', gradient: ['#1565c0', '#42a5f5'] },
  '박지성': { emoji: '🏆', label: '박지성', gradient: ['#c62828', '#ef5350'] },
  '축구': { emoji: '⚽', label: 'Soccer', gradient: ['#2e7d32', '#66bb6a'] },
  '야구': { emoji: '⚾', label: 'Baseball', gradient: ['#1565c0', '#1976d2'] },
  '농구': { emoji: '🏀', label: 'Basketball', gradient: ['#e65100', '#ff6d00'] },
  '수영': { emoji: '🏊', label: 'Swimming', gradient: ['#0277bd', '#4fc3f7'] },
  '달리기': { emoji: '🏃', label: 'Running', gradient: ['#ff6f00', '#ffa726'] },

  // IT/기기
  '아이폰': { emoji: '📱', label: 'iPhone', gradient: ['#37474f', '#607d8b'] },
  '갤럭시': { emoji: '📱', label: 'Galaxy', gradient: ['#0d47a1', '#1976d2'] },
  '맥북': { emoji: '💻', label: 'MacBook', gradient: ['#bdbdbd', '#9e9e9e'] },
  '윈도우': { emoji: '🖥️', label: 'Windows', gradient: ['#0078d4', '#4fc3f7'] },
  '게임': { emoji: '🎮', label: 'Game', gradient: ['#6a1b9a', '#ab47bc'] },
  '유튜브': { emoji: '📺', label: 'YouTube', gradient: ['#c62828', '#ef5350'] },
  '인스타': { emoji: '📷', label: 'Instagram', gradient: ['#833ab4', '#fd1d1d'] },

  // 교통
  '자동차': { emoji: '🚗', label: 'Car', gradient: ['#37474f', '#546e7a'] },
  '자전거': { emoji: '🚲', label: 'Bicycle', gradient: ['#2e7d32', '#4caf50'] },
  '비행기': { emoji: '✈️', label: 'Airplane', gradient: ['#1565c0', '#42a5f5'] },
  '기차': { emoji: '🚄', label: 'Train', gradient: ['#37474f', '#78909c'] },
  '버스': { emoji: '🚌', label: 'Bus', gradient: ['#f57f17', '#fdd835'] },
  '지하철': { emoji: '🚇', label: 'Subway', gradient: ['#1b5e20', '#4caf50'] },

  // 기타
  '돈': { emoji: '💰', label: 'Money', gradient: ['#1b5e20', '#4caf50'] },
  '사랑': { emoji: '❤️', label: 'Love', gradient: ['#c62828', '#ef5350'] },
  '음악': { emoji: '🎵', label: 'Music', gradient: ['#6a1b9a', '#ab47bc'] },
  '영화': { emoji: '🎬', label: 'Movie', gradient: ['#263238', '#455a64'] },
  '책': { emoji: '📚', label: 'Book', gradient: ['#4e342e', '#795548'] },
  '학교': { emoji: '🏫', label: 'School', gradient: ['#1565c0', '#42a5f5'] },
  '회사': { emoji: '🏢', label: 'Office', gradient: ['#455a64', '#607d8b'] },
  '집': { emoji: '🏠', label: 'Home', gradient: ['#ef6c00', '#ff9800'] },
  '여행': { emoji: '✈️', label: 'Travel', gradient: ['#00838f', '#26c6da'] },
  '운동': { emoji: '💪', label: 'Exercise', gradient: ['#d32f2f', '#ef5350'] },
  '공부': { emoji: '📖', label: 'Study', gradient: ['#283593', '#5c6bc0'] },
  '노래': { emoji: '🎤', label: 'Singing', gradient: ['#ad1457', '#e91e63'] },
  '춤': { emoji: '💃', label: 'Dance', gradient: ['#6a1b9a', '#ce93d8'] },
};

/**
 * 텍스트에서 가장 적합한 키워드 매핑을 찾습니다.
 * 우선순위: 완전 일치 → 시작/끝 일치 → 가장 긴 키워드 부분 일치
 */
function findBestMapping(text: string): KeywordMapping | null {
  const trimmed = text.trim();
  const entries = Object.entries(KEYWORD_MAP);

  // 1순위: 완전 일치
  for (const [korean, mapping] of entries) {
    if (trimmed === korean) return mapping;
  }

  // 2순위: 시작 또는 끝 일치 (예: '민초파' → '민초' 매칭)
  // 더 긴 키워드를 우선 매칭 (예: '민트초코' > '민초')
  const sortedByLength = [...entries].sort((a, b) => b[0].length - a[0].length);
  for (const [korean, mapping] of sortedByLength) {
    if (trimmed.startsWith(korean) || trimmed.endsWith(korean)) {
      return mapping;
    }
  }

  // 3순위: 가장 긴 키워드 부분 일치
  for (const [korean, mapping] of sortedByLength) {
    if (trimmed.includes(korean)) {
      return mapping;
    }
  }

  return null;
}

/**
 * 문자열로부터 일관된 해시 값을 생성합니다.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 프롬프트 기반으로 그라디언트 색상을 생성합니다.
 */
function generateGradient(prompt: string): [string, string] {
  const hash = hashString(prompt);
  const hue = hash % 360;
  return [
    `hsl(${hue}, 65%, 35%)`,
    `hsl(${(hue + 30) % 360}, 70%, 50%)`,
  ];
}

/**
 * 첫 글자에서 대표 이모지를 추론합니다.
 */
function getDefaultEmoji(prompt: string): string {
  const emojis = ['🗳️', '💡', '🎯', '🔥', '⭐', '💎', '🏆', '🎪', '🌟', '🎭'];
  const hash = hashString(prompt);
  return emojis[hash % emojis.length];
}

/**
 * SVG 기반 이미지를 생성합니다.
 * 선택지 텍스트에 맞는 이모지 + 그라디언트 배경으로 항상 관련성 있는 이미지를 만듭니다.
 */
function createSVGImage(prompt: string, optionLabel: string): string {
  const mapping = findBestMapping(optionLabel) || findBestMapping(prompt);
  const emoji = mapping?.emoji || getDefaultEmoji(optionLabel);
  const gradient = mapping?.gradient || generateGradient(optionLabel);

  // 표시할 텍스트 (최대 8자)
  const displayText = optionLabel.length > 8
    ? optionLabel.substring(0, 8) + '…'
    : optionLabel;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- 배경 그라디언트 -->
  <rect width="800" height="600" fill="url(#bg)" rx="0"/>
  
  <!-- 장식 원 -->
  <circle cx="650" cy="100" r="200" fill="rgba(255,255,255,0.05)"/>
  <circle cx="150" cy="500" r="150" fill="rgba(255,255,255,0.05)"/>
  <circle cx="400" cy="300" r="250" fill="url(#glow)"/>
  
  <!-- 이모지 -->
  <text x="400" y="260" font-size="150" text-anchor="middle" dominant-baseline="middle" filter="url(#shadow)">${emoji}</text>
  
  <!-- 라벨 배경 -->
  <rect x="200" y="380" width="400" height="60" rx="30" fill="rgba(0,0,0,0.3)"/>
  
  <!-- 라벨 텍스트 -->
  <text x="400" y="418" font-family="'Segoe UI', 'Apple SD Gothic Neo', sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${displayText}</text>
  
  <!-- 하단 장식 -->
  <rect x="350" y="470" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
</svg>`.trim();

  // SVG를 data URL로 변환
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * AI 이미지 생성 시뮬레이션
 * 선택지 텍스트에 맞는 SVG 이미지를 즉시 생성합니다.
 */
export async function simulateAIGeneration(prompt: string, optionLabel?: string): Promise<string> {
  // 0.5~1초 딜레이로 AI 생성 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  const label = optionLabel || prompt;
  return createSVGImage(prompt, label);
}

/**
 * 실제 AI 이미지 생성 함수
 *
 * 1. 기존 사전에 있는 단어는 어울리는 SVG 그래픽 생성
 * 2. 사전에 없는 단어는 번역 API(MyMemory)로 한->영 번역 후 저작권 프리 이미지(LoremFlickr) 검색하여 실시간 고정 이미지 반환
 * 3. 예외 상황 시 SVG 생성기로 안전한 폴백
 */
export async function generateAIImage(prompt: string, optionLabel?: string): Promise<string> {
  const label = optionLabel || prompt;

  // 1. 기존 사전에 매칭되는 단어면 고품질 SVG 바로 생성
  const mapping = findBestMapping(label);
  if (mapping) {
    return createSVGImage(prompt, label);
  }

  // 2. 사전에 없는 단어는 실시간 번역 + 저작권 프리 이미지 검색
  try {
    const cleanLabel = label.trim();
    if (cleanLabel) {
      // MyMemory 무료 번역 API 호출 (한 -> 영)
      const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanLabel)}&langpair=ko|en`;
      const transRes = await fetch(translateUrl);
      if (transRes.ok) {
        const transData = await transRes.json();
        const translatedText = transData.responseData?.translatedText || transData.matches?.[0]?.translation;
        if (translatedText && !translatedText.toLowerCase().includes('mymemory')) {
          // 공백을 쉼표로 치환하여 태그 검색
          const query = translatedText
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, ',');

          // LoremFlickr에서 해당 태그가 포함된 실시간 무료 이미지 검색
          // 리다이렉션된 최종 이미지 경로를 리턴받아 영구 고정
          const imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(query)}/all`;
          const imageRes = await fetch(imageUrl);
          if (imageRes.ok && imageRes.url) {
            return imageRes.url;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[AI Image Search] 실시간 이미지 검색 실패, SVG로 폴백:', err);
  }

  // 3. 실패 시 기존 SVG 이미지로 폴백
  return simulateAIGeneration(prompt, label);
}
