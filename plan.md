# 연예인 공항패션 분석기 구현 계획

## Context
사용자가 연예인 공항패션 사진을 업로드하면 Claude Vision AI로 옷들을 분석하고,
각 의류 아이템에 대해 종류/설명, 색상/소재 정보와 네이버 쇼핑 유사상품을 보여주는 웹앱.

## 기술 스택
- Frontend: React + Vite (모던 미니멀 UI)
- Backend: Node.js + Express
- AI: Claude API (claude-sonnet-4-6, vision)
- 쇼핑 검색: 네이버 쇼핑 API

---

## 디렉토리 구조

```
C:/fashion/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # 메인 레이아웃
│   │   ├── components/
│   │   │   ├── ImageUploader.jsx   # 드래그앤드롭 업로드
│   │   │   ├── ClothingCard.jsx    # 의류 아이템 카드
│   │   │   └── ProductGrid.jsx     # 네이버 상품 그리드
│   │   ├── index.css            # 전역 스타일
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js           # proxy: /api → :4000
│   └── package.json
├── backend/
│   ├── server.js                # Express 서버
│   ├── routes/
│   │   ├── analyze.js           # POST /api/analyze
│   │   └── search.js            # GET /api/search
│   └── package.json
└── .env                         # API 키 저장
```

---

## 핵심 구현

### 1. 이미지 업로드 (ImageUploader.jsx)
- 드래그앤드롭 + 클릭 업로드
- 업로드된 이미지 미리보기
- "분석 시작" 버튼

### 2. Claude Vision 분석 (routes/analyze.js)
- 이미지를 base64로 받아 Claude API에 전달
- 시스템 프롬프트: 사진에서 각 의류 아이템을 JSON 배열로 추출
- 반환 형식:
```json
[
  {
    "id": 1,
    "category": "아우터",
    "name": "트렌치코트",
    "description": "더블브레스트 베이지 트렌치코트",
    "color": "베이지",
    "material": "면/폴리 혼방",
    "searchQuery": "베이지 트렌치코트 여성"
  }
]
```

### 3. 네이버 쇼핑 검색 (routes/search.js)
- GET /api/search?query=베이지+트렌치코트
- 네이버 쇼핑 API 호출 (display: 6개)
- 반환: 상품명, 가격, 이미지, 링크

### 4. 결과 UI (ClothingCard.jsx)
- 의류 카테고리 아이콘 (이모지)
- 이름, 설명, 색상/소재 표시
- "유사상품 보기" 버튼 → 클릭 시 ProductGrid 표시

### 5. 상품 그리드 (ProductGrid.jsx)
- 3열 그리드로 6개 상품 표시
- 상품 이미지, 이름, 가격
- 클릭 시 네이버 쇼핑 페이지로 이동

---

## .env 구성
```
ANTHROPIC_API_KEY=your_key_here
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

---

## 실행 방법
```bash
# 백엔드
cd backend && npm install && npm start   # :4000

# 프론트엔드
cd frontend && npm install && npm run dev  # :5173
```

---

## 검증 방법
1. 프론트 `http://localhost:5173` 접속
2. 연예인 공항패션 사진 업로드
3. 분석 결과에 의류 아이템 카드 표시 확인
4. "유사상품 보기" 클릭 → 네이버 상품 6개 표시 확인
5. 상품 클릭 → 네이버 쇼핑 페이지 이동 확인
