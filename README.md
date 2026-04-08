# Celebrity Fashion

연예인 패션을 탐색하고, AI로 분석하고, 서로 옷을 바꿔입혀보는 웹앱

## 기능

- **연예인 프로필** — 아이유 등 연예인별 패션 피드 (fashionn.com 실시간 크롤링)
- **스타일 필터** — 패션 / 공항 / 화보 / 무대 / 일상별 탭 분류
- **패션 분석** — 사진 업로드 시 Claude AI가 착용 아이템 분석 + 네이버 쇼핑 연결
- **스타일 스왑** — 두 사람 사진을 올리면 AI가 옷을 바꿔입힌 이미지 생성

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프론트엔드 | React 18, Vite, React Router |
| 백엔드 | Node.js, Express |
| AI 분석 | Claude API (claude-haiku) |
| 이미지 합성 | Replicate IDM-VTON |
| 뉴스 크롤링 | fashionn.com + Cheerio |

## 시작하기

### 1. 환경변수 설정

루트에 `.env` 파일 생성:

```
ANTHROPIC_API_KEY=sk-ant-...
REPLICATE_API_TOKEN=r8_...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
```

### 2. 백엔드 실행

```bash
cd backend
npm install
npm start        # http://localhost:4000
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

## API 키 발급

| 서비스 | 용도 | 링크 |
|--------|------|------|
| Anthropic | 패션 분석, 스타일 스왑 설명 | [console.anthropic.com](https://console.anthropic.com) |
| Replicate | 가상 피팅 이미지 생성 | [replicate.com](https://replicate.com) |
| Naver Developers | 뉴스/이미지 검색 (선택) | [developers.naver.com](https://developers.naver.com) |
