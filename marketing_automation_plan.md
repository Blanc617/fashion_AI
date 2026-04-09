# AI 자동화 마케팅 파이프라인 계획서

> Celebrity Fashion 웹 서비스 자동 홍보 블로그 발행 시스템

---

## 1. 목표

AI가 서비스 소개 및 홍보 블로그 글을 자동 작성하고, 아래 3개 플랫폼에 자동 업로드한다.

| 플랫폼 | 대상 독자 | 업로드 방식 |
|---|---|---|
| 네이버 블로그 | 국내 일반 사용자 | Selenium 자동화 |
| dev.to | 해외 개발자 | REST API |
| Hashnode | 해외 개발자/테크 | GraphQL API |

---

## 2. 전체 파이프라인

```
사용자 입력 (주제 힌트, 타겟 플랫폼)
    │
    ▼
[1] 트렌드 리서치
    - 패션 키워드 크롤링 (fashionn.com, 네이버 트렌드)
    - 최근 인기 연예인 패션 이슈 수집
    │
    ▼
[2] 주제 선정 & 평가
    - Claude가 3~5개 주제 후보 생성
    - 검색량·경쟁도·서비스 연관성 기준 자동 채점
    - 최고 점수 주제 선택
    │
    ▼
[3] 콘텐츠 생성
    - 플랫폼별 포맷 맞춤 글 작성 (Claude API)
    - 네이버: 구어체, 이모지, 해시태그
    - dev.to / Hashnode: 마크다운, 기술적 톤
    │
    ▼
[4] 콘텐츠 평가
    - 품질 체크 (Claude 자가 평가)
    - 기준 미달 시 재생성 (최대 2회)
    │
    ▼
[5] 플랫폼 업로드
    - 네이버: Selenium 자동화
    - dev.to: REST API (POST /articles)
    - Hashnode: GraphQL API (createPublicationStory)
    │
    ▼
[6] 회고 & 자가 개선
    - 발행 결과 기록 (성공/실패, 소요 시간)
    - 프롬프트 개선 포인트 자동 메모
    │
    ▼
[7] 리포트 발송 & DB 저장
    - 결과 요약 메일 또는 카카오톡 메시지 발송
    - Supabase에 발행 이력 저장
```

---

## 3. 디렉토리 구조

```
fashion_AI/
├── marketing/
│   ├── pipeline.py           # 메인 파이프라인 실행 진입점
│   ├── research.py           # [1] 트렌드 리서치
│   ├── topic_selector.py     # [2] 주제 선정 & 평가
│   ├── content_writer.py     # [3] 콘텐츠 생성 (Claude API)
│   ├── evaluator.py          # [4] 콘텐츠 평가
│   ├── publishers/
│   │   ├── naver.py          # [5-A] 네이버 블로그 발행 (Selenium)
│   │   ├── devto.py          # [5-B] dev.to API 발행
│   │   └── hashnode.py       # [5-C] Hashnode API 발행
│   ├── reporter.py           # [7] 리포트 & DB 저장
│   └── prompts/
│       ├── naver_prompt.txt  # 네이버용 글쓰기 프롬프트
│       ├── devto_prompt.txt  # dev.to용 프롬프트
│       └── hashnode_prompt.txt
├── share_naver_test.py       # 기존 네이버 테스트 파일
└── marketing_automation_plan.md
```

---

## 4. 각 모듈 상세 설계

### [1] 트렌드 리서치 (`research.py`)

```python
# 수집 대상
- fashionn.com 최신 기사 제목 20개
- 네이버 데이터랩 API: 패션 관련 검색어 트렌드
- 수집 결과를 Claude에게 전달해 "지금 핫한 패션 이슈 5가지" 요약
```

**입력:** 없음 (자동 수집)
**출력:** `{ trends: ["이슈1", "이슈2", ...] }`

---

### [2] 주제 선정 & 평가 (`topic_selector.py`)

```python
# Claude 프롬프트 예시
"""
다음 트렌드를 바탕으로 'Celebrity Fashion AI 서비스'를 소개할 수 있는
블로그 주제 5개를 제안해줘. 각 주제에 대해 아래 기준으로 1~10점 채점해줘.
- 검색 유입 가능성
- 서비스 홍보 자연스러움
- 독자 흥미도
"""

# 출력 예시
[
  { "title": "아이유 공항패션 완벽 분석 AI로 해봤더니...", "score": 8.5 },
  { "title": "제니 스타일 따라하기, AI가 쇼핑까지 해준다?", "score": 9.2 },
  ...
]
```

**입력:** 트렌드 리스트
**출력:** 최고 점수 주제 1개 선택

---

### [3] 콘텐츠 생성 (`content_writer.py`)

플랫폼별로 다른 프롬프트 사용:

#### 네이버 블로그 포맷
```
- 분량: 800~1200자
- 어투: 친근한 구어체 ("~해요", "~거든요")
- 구성: 도입부 → 서비스 소개 → 핵심 기능 3가지 → 사용 방법 → 마무리
- 이모지 포함 (제목, 소제목)
- 해시태그 10개 (본문 하단)
- 서비스 URL 자연스럽게 1~2회 삽입
```

#### dev.to / Hashnode 포맷
```
- 분량: 600~900 단어 (영문)
- 어투: 기술 블로그 톤
- 구성: 문제 제기 → 솔루션 소개 → 기술 스택 → 데모 → 마무리
- 마크다운 형식 (## 소제목, 코드블록 등)
- 태그: fashion, ai, claude, react 등
```

**입력:** 선정된 주제, 플랫폼 종류
**출력:** 완성된 글 (제목 + 본문 + 태그)

---

### [4] 콘텐츠 평가 (`evaluator.py`)

```python
# 평가 기준
CRITERIA = {
    "서비스_언급_자연스러움": 0~10,
    "읽기_편한_구조": 0~10,
    "키워드_포함_여부": 0~10,
    "플랫폼_포맷_준수": 0~10,
}
# 평균 7점 미만 → 재생성 요청 (최대 2회)
```

---

### [5-A] 네이버 발행 (`publishers/naver.py`)

기존 `share_naver_test.py` 기반으로 개선:

```python
# 주요 개선 사항
1. 아이디/비밀번호 환경변수(.env)로 분리
2. 제목·본문을 content_writer 결과로 동적 주입
3. 카테고리 자동 설정 (패션/뷰티)
4. 태그(해시태그) 자동 입력
5. 캡챠 발생 시 슬랙/카카오 알림 후 수동 대기
6. 발행 성공 여부 반환
```

**주의:** 네이버 캡챠 정책으로 인해 첫 실행 시 수동 개입 필요할 수 있음.

---

### [5-B] dev.to 발행 (`publishers/devto.py`)

```python
import requests

def publish_devto(title, body, tags):
    res = requests.post(
        "https://dev.to/api/articles",
        headers={"api-key": DEV_TO_API_KEY},
        json={
            "article": {
                "title": title,
                "body_markdown": body,
                "published": True,
                "tags": tags,
            }
        }
    )
    return res.json()
```

**필요 환경변수:** `DEV_TO_API_KEY`

---

### [5-C] Hashnode 발행 (`publishers/hashnode.py`)

```python
import requests

MUTATION = """
mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) {
    post { id url title }
  }
}
"""

def publish_hashnode(title, body, tags, publication_id):
    res = requests.post(
        "https://gql.hashnode.com",
        headers={"Authorization": HASHNODE_API_KEY},
        json={
            "query": MUTATION,
            "variables": {
                "input": {
                    "title": title,
                    "contentMarkdown": body,
                    "tags": [{"name": t} for t in tags],
                    "publicationId": publication_id,
                }
            }
        }
    )
    return res.json()
```

**필요 환경변수:** `HASHNODE_API_KEY`, `HASHNODE_PUBLICATION_ID`

---

### [7] 리포트 & DB 저장 (`reporter.py`)

**Supabase 테이블: `marketing_posts`**
```sql
id          uuid
platform    text       -- 'naver' | 'devto' | 'hashnode'
title       text
url         text
published_at timestamp
status      text       -- 'success' | 'failed'
score       float      -- 콘텐츠 평가 점수
topic       text
created_at  timestamp
```

**리포트 발송 옵션:**
- 이메일 (SMTP 또는 SendGrid)
- 카카오 알림톡
- 슬랙 Webhook

---

## 5. 환경변수 목록 (`.env` 추가 항목)

```env
# 네이버
NAVER_BLOG_ID=mhophouse
NAVER_ID=...
NAVER_PW=...

# dev.to
DEV_TO_API_KEY=...

# Hashnode
HASHNODE_API_KEY=...
HASHNODE_PUBLICATION_ID=...

# 리포트 (택1)
REPORT_EMAIL=...
KAKAO_ACCESS_TOKEN=...
SLACK_WEBHOOK_URL=...
```

---

## 6. 실행 방법

```bash
# 1회 수동 실행
python marketing/pipeline.py --platforms naver devto hashnode

# 특정 플랫폼만
python marketing/pipeline.py --platforms naver

# 주제 직접 지정
python marketing/pipeline.py --topic "제니 패션 AI 분석" --platforms devto
```

---

## 7. 구현 순서 (추천)

| 단계 | 작업 | 예상 소요 |
|---|---|---|
| 1 | `content_writer.py` — Claude로 네이버 글 초안 생성 | 1일 |
| 2 | `publishers/naver.py` — 기존 테스트 파일 개선·완성 | 1~2일 |
| 3 | 1+2 통합 테스트 (네이버 단독 파이프라인) | 0.5일 |
| 4 | `publishers/devto.py` + `publishers/hashnode.py` — API 연동 | 1일 |
| 5 | `research.py` + `topic_selector.py` — 자동 주제 선정 | 1일 |
| 6 | `evaluator.py` + `reporter.py` — 품질 평가 + DB 저장 | 1일 |
| 7 | 전체 `pipeline.py` 통합 + 스케줄러 연동 | 0.5일 |

> **추천 시작점:** 2단계(콘텐츠 생성 → 네이버 발행)부터 먼저 완성하고,
> 이후 dev.to/Hashnode → 트렌드 리서치 순으로 확장.

---

## 8. 리스크 & 주의사항

| 리스크 | 대응 방안 |
|---|---|
| 네이버 캡챠 | 발생 시 카카오/슬랙 알림 → 수동 처리 후 재개 |
| 네이버 자동화 감지 | 발행 간격 랜덤 딜레이, User-Agent 위장 유지 |
| Claude API 비용 | 글 1편당 약 $0.002~0.005 (Haiku 기준) |
| dev.to/Hashnode 스팸 정책 | 동일 내용 복붙 금지 → 플랫폼별 변형 필수 |
| 발행 실패 시 | 최대 3회 재시도 → 실패 로그 Supabase 저장 |
