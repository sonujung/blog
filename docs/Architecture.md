# sonujung.com 블로그 아키텍처 설계

## 기술 스택 (Option 1 선택)

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Headless UI / Radix UI
- **폰트**: Pretendard (한글 최적화)

### 디자인 시스템
- **스타일**: 뉴욕 스타일 에디토리얼 (학구적 미니멀)
- **레이아웃**: 수직 목록 형태 (카드 없음)
- **색상**: 화이트 베이스 + 서브틀한 그레이
- **타이포그래피**: Pretendard Variable (산세리프)
- **구조**: 날짜-제목-부제목 세로 나열

### 백엔드 & API
- **API Routes**: Next.js 서버리스 함수
- **콘텐츠 소스**: 정적 마크다운 파일
- **데이터 캐싱**: Next.js ISR (Incremental Static Regeneration)
- **이미지 최적화**: Vercel Image Optimization

### 무료 서비스 통합
- **호스팅**: Vercel (무료 플랜)
- **댓글**: Giscus (GitHub Issues 기반)
- **검색**: Fuse.js (클라이언트 사이드)
- **뉴스레터**: ConvertKit (월 1000명 무료)
- **분석**: Vercel Analytics (무료) + Google Analytics 4
- **이미지 호스팅**: GitHub Repository + Vercel CDN

## 시스템 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Notion CMS    │────▶│   Next.js App    │────▶│   Vercel Edge   │
│                 │    │                  │    │     Network     │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │                 │
│ │ Blog Posts  │ │    │ │ API Routes   │ │    │ ┌─────────────┐ │
│ │ Database    │ │    │ │ - RSS Feed   │ │    │ │ sonujung.com│ │  
│ └─────────────┘ │    │ │ - Search     │ │    │ │   (Custom   │ │
│                 │    │ │ - Newsletter │ │    │ │    Domain)  │ │
│ ┌─────────────┐ │    │ └──────────────┘ │    │ └─────────────┘ │
│ │ Page Blocks │ │    │                  │    │                 │
│ │ (Rich Text) │ │    │ ┌──────────────┐ │    └─────────────────┘
│ └─────────────┘ │    │ │ Static Pages │ │              │
└─────────────────┘    │ │ (ISR Cached) │ │              │
                       │ └──────────────┘ │              ▼
┌─────────────────┐    └──────────────────┘    ┌─────────────────┐
│ GitHub Issues   │                            │     Users       │
│ (Comments via   │◀───────────────────────────│ - Readers       │
│    Giscus)      │                            │ - Subscribers   │
└─────────────────┘                            │ - Commenters    │
                                               └─────────────────┘
```

## 프로젝트 구조

```
/blog
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx            # 홈페이지 (포스트 목록)
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 개별 포스트
│   │   ├── tag/
│   │   │   └── [tag]/
│   │   │       └── page.tsx    # 태그별 포스트
│   │   ├── search/
│   │   │   └── page.tsx        # 검색 페이지
│   │   ├── subscribe/
│   │   │   └── page.tsx        # 뉴스레터 구독
│   │   ├── api/
│   │   │   ├── rss/route.ts    # RSS 피드
│   │   │   ├── search/route.ts # 검색 API
│   │   │   └── newsletter/route.ts # 뉴스레터
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # 재사용 UI 컴포넌트
│   │   ├── blog/
│   │   │   ├── PostItem.tsx    # 에디토리얼 스타일 포스트 아이템
│   │   │   ├── PostContent.tsx # 깔끔한 본문 렌더러  
│   │   │   ├── PostMeta.tsx    # 날짜, 태그 메타정보
│   │   │   └── Comments.tsx    # Giscus 댓글
│   │   ├── layout/
│   │   │   ├── Header.tsx      # 심플한 헤더 (로고만)
│   │   │   ├── Footer.tsx      # 미니멀 푸터
│   │   │   └── Navigation.tsx  # 서치/구독 링크
│   │   └── search/
│   │       └── SearchBox.tsx   # 깔끔한 검색창
│   ├── lib/
│   │   ├── markdown.ts         # 마크다운 파일 처리
│   │   ├── blog.ts             # 블로그 데이터 로직
│   │   ├── search.ts           # 검색 로직
│   │   ├── rss.ts              # RSS 생성
│   │   ├── newsletter.ts       # 뉴스레터 통합
│   │   └── utils.ts            # 유틸리티
│   ├── types/
│   │   ├── blog.ts             # 블로그 타입 정의
│   │   └── blog.ts             # 블로그 콘텐츠 타입
│   └── styles/
│       ├── globals.css         # Pretendard 폰트 import
│       └── components.css      # 미니멀 커스텀 스타일
├── public/
│   ├── images/                 # 마이그레이션된 이미지
│   ├── fonts/                  # Pretendard 폰트 파일들
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/
│   ├── migrate-hashnode.ts     # Hashnode 마이그레이션
│   └── notify-new-post.ts      # 새 포스트 알림 스크립트
├── docs/                       # 프로젝트 문서
├── .env.local                  # 환경 변수
├── next.config.js
├── tailwind.config.js          # Pretendard 폰트 설정
├── tsconfig.json
└── package.json
```

## 데이터 플로우

### 1. 콘텐츠 발행 플로우
```
Notion 작성 → Notion API → Next.js ISR → Vercel 배포 → 사용자
     ↓
Database 저장 → 자동 리빌드 → 캐시 무효화 → 새 콘텐츠 반영
```

### 2. 검색 플로우
```
사용자 검색 → 클라이언트 Fuse.js → 인덱싱된 포스트 → 결과 표시
                    ↓
            (빌드타임에 검색 인덱스 생성)
```

### 3. 댓글 플로우
```
사용자 댓글 → GitHub OAuth → Giscus → GitHub Issues → 댓글 표시
```

## 성능 최적화 전략

### 1. ISR (Incremental Static Regeneration)
- 홈페이지: 1시간 재생성
- 블로그 포스트: 24시간 재생성
- 태그 페이지: 6시간 재생성

### 2. 이미지 최적화
- Vercel Image Component 사용
- WebP 자동 변환
- 적응형 이미지 크기
- 지연 로딩 (Lazy Loading)

### 3. 번들 최적화
- Dynamic Imports
- Tree Shaking
- Code Splitting by Route

## 배포 전략

### 1. 자동 배포
```
Git Push → Vercel Webhook → Build → Deploy → Domain
```

### 2. 환경별 설정
- **Production**: sonujung.com
- **Preview**: Vercel Preview URL (PR별)
- **Development**: localhost:3000

### 3. 도메인 설정
- Vercel에 sonujung.com 커스텀 도메인 연결
- SSL 인증서 자동 관리
- DNS 설정: CNAME to Vercel

## 마이그레이션 전략

### Phase 1: 기반 구축 (1-2주)
- Next.js 프로젝트 초기화
- 기본 레이아웃 및 컴포넌트
- Notion API 연동
- Vercel 배포 설정

### Phase 2: 콘텐츠 마이그레이션 (1주)  
- Hashnode 콘텐츠 추출 스크립트
- 이미지 다운로드 및 호스팅 이전
- Notion 데이터베이스 구조화
- URL 매핑 및 리다이렉션

### Phase 3: 기능 완성 (1-2주)
- 댓글 시스템 (Giscus)
- 검색 기능
- RSS 피드
- 뉴스레터 연동
- SEO 최적화

### Phase 4: 최적화 및 런칭 (1주)
- 성능 튜닝
- 도메인 전환
- 모니터링 설정

## 모니터링 & 유지보수

### 성능 모니터링
- Vercel Analytics (페이지뷰, 성능)
- Google Analytics 4 (사용자 행동)
- Lighthouse CI (성능 점수)

### 에러 추적
- Vercel 로그
- Next.js 에러 바운더리
- 서드파티 서비스 상태 모니터링

### 백업 전략
- Git Repository (코드)
- Notion Database (콘텐츠)
- GitHub Repository (이미지)

---
**문서 관리**: 아키텍처 변경 시 실시간 반영