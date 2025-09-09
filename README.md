# sonujung.com 블로그

학구적이고 미니멀한 개발 블로그 - Next.js 14 + 정적 마크다운 파일 + Vercel

## 🎯 특징

- **뉴욕 스타일 에디토리얼 디자인**: 카드 없는 목록 형태의 미니멀한 레이아웃
- **Pretendard 폰트**: 한글 최적화된 산세리프 타이포그래피
- **마크다운 기반 워크플로우**: 직접 마크다운 파일 편집 → Git 관리
- **완전 정적**: API 의존성 제거로 빠른 로딩과 안정성 확보
- **완전 무료**: Vercel 호스팅 + GitHub + 무료 서비스들만 사용

## 🚀 기능

### 핵심 기능
- ✅ 블로그 포스트 목록 및 상세 페이지 (68개 포스트 마이그레이션 완료)
- ✅ 깔끔한 URL 구조 (`/blog/post-title`)
- ✅ 태그 기반 분류
- ✅ RSS 피드 생성
- ✅ 뉴스레터 구독 시스템 (Resend 연동, 관리자 대시보드)
- ✅ 댓글 시스템 (Giscus)
- ✅ SEO 최적화 (메타데이터, 사이트맵, robots.txt)
- ✅ 이미지 최적화 및 로컬 저장

### 마이그레이션 완료
- ✅ Hashnode → Notion 데이터베이스 (72개 포스트)
- ✅ Notion → 마크다운 파일 변환 (68개 포스트)
- ✅ 원본 블로그 URL 구조 유지
- ✅ 메타데이터 보존 (제목, 날짜, 작성자, 태그)

## 🛠 기술 스택

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **Pretendard Font**
- **정적 마크다운 파일** (content/posts/)
- **정적 마크다운 파일** (content/posts/)
- **Resend** (이메일 구독 서비스)
- **Vercel** (호스팅 + 이미지 최적화)
- **Giscus** (GitHub 기반 댓글)

## 📦 설치 및 실행

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local`에 다음 값들을 설정:
```bash
# Resend 이메일 서비스
RESEND_API_KEY=your_resend_api_key

# 사이트 설정
NEXT_PUBLIC_SITE_URL=https://sonujung.com
NEXT_PUBLIC_SITE_NAME="sonujung.com"
NEXT_PUBLIC_SITE_DESCRIPTION="정선우의 블로그입니다."

# Giscus 댓글
NEXT_PUBLIC_GISCUS_REPO=sonujung/blog
NEXT_PUBLIC_GISCUS_REPO_ID=your_repo_id
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 🔄 콘텐츠 관리 워크플로우

### 마크다운 파일 편집
`content/posts/` 디렉토리에서 직접 마크다운 파일을 편집합니다.

```
content/posts/2024-01-01-example-post.md
```

### 변경사항 배포
```bash
git add content/posts/
git commit -m "새 포스트 추가"
git push origin main
```

## 📧 이메일 구독 시스템

완전히 구현된 이메일 뉴스레터 시스템을 제공합니다.

### 기능
- ✅ **웰컴 이메일**: 구독 시 전문적인 환영 이메일 발송
- ✅ **새 포스트 알림**: 포스트 발행 시 모든 구독자에게 자동 알림
- ✅ **구독 취소**: 원클릭 구독 취소 + 확인 이메일
- ✅ **관리자 대시보드**: 구독자 통계, 테스트 발송, 관리 기능
- ✅ **반응형 이메일 템플릿**: 모든 이메일 클라이언트 호환

### 설정 방법

1. **Resend 계정 설정**
   - [resend.com](https://resend.com)에서 계정 생성
   - API 키 발급
   - `.env.local`에 설정
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   NOTIFICATION_API_KEY=secure_random_key_for_notifications
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```

2. **기능 테스트**
   ```bash
   # 개발 서버 실행
   npm run dev
   
   # 구독 페이지 접속
   http://localhost:3000/subscribe
   
   # 관리자 대시보드 접속
   http://localhost:3000/admin/subscribers
   ```

3. **새 포스트 알림 발송**
   ```bash
   # API 호출로 알림 발송
   curl -X POST http://localhost:3000/api/notify-subscribers \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_notification_api_key" \
     -d '{"slug": "your-post-slug", "action": "notify"}'
   ```

### 파일 구조
```
src/
├── app/
│   ├── subscribe/page.tsx      # 구독 페이지
│   ├── unsubscribe/page.tsx    # 구독취소 페이지
│   ├── admin/subscribers/      # 관리자 대시보드
│   └── api/
│       ├── subscribe/          # 구독 API
│       ├── unsubscribe/        # 구독취소 API
│       └── notify-subscribers/ # 알림 발송 API
├── lib/
│   ├── subscribers.ts          # 구독자 데이터 관리
│   └── email-templates.ts      # 이메일 템플릿
└── data/
    └── subscribers.json        # 구독자 데이터 (자동 생성)
```

## 🚀 배포

### Vercel 배포
```bash
npx vercel --prod
```

### 환경 변수 설정
```bash
vercel env add RESEND_API_KEY
vercel env add NOTIFICATION_API_KEY
vercel env add NEXT_PUBLIC_ADMIN_PASSWORD
vercel env add NEXT_PUBLIC_SITE_URL
```

### 커스텀 도메인 연결
Vercel 대시보드에서 `sonujung.com` 도메인 연결

## 📁 프로젝트 구조

```
blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # 홈페이지 (포스트 목록)
│   │   ├── blog/[slug]/    # 개별 포스트 페이지
│   │   ├── subscribe/      # 구독 페이지
│   │   └── api/            # API 엔드포인트
│   ├── lib/
│   │   ├── markdown.ts     # 마크다운 파일 처리
│   │   └── utils.ts        # 유틸리티 함수
│   └── types/
│       └── blog.ts         # 타입 정의
├── content/
│   ├── posts/              # 마크다운 포스트 파일들
│   └── images/             # 로컬 이미지 파일들
├── scripts/
│   └── notify-new-post.ts       # 포스트 알림 스크립트
├── RESEND_SETUP.md         # 이메일 설정 가이드
└── package.json
```

## 🎨 디자인 특징

- **뉴욕 타임즈 스타일**: 미니멀한 타이포그래피 중심
- **무카드 디자인**: 깔끔한 리스트 형태
- **Pretendard 폰트**: 한글 가독성 최적화
- **반응형**: 모바일/데스크탑 완벽 지원
- **다크모드 없음**: 일관된 화이트 테마

## 📊 성능 최적화

- **정적 생성**: API 의존성 제거로 빠른 로딩
- **이미지 최적화**: 로컬 저장 + Next.js Image 컴포넌트
- **SEO 최적화**: 구조화된 메타데이터
- **RSS 피드**: `/api/rss` 엔드포인트

## 🔧 개발 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run notify-post  # 새 포스트 알림 발송
npm run lint         # ESLint 실행
npm run typecheck    # TypeScript 체크
```

## 🎯 로드맵

- [ ] 이미지 파일 경로 및 참조 정리
- [ ] 정적 빌드 성능 최적화 및 검증
- [ ] 도메인 DNS 설정 및 연결 (최종 단계)
- [ ] 구독자 관리 기능 개선
- [ ] 포스트 검색 기능 추가 (선택사항)

---

**현재 상태**: 블로그 기본 기능 완료, 68개 포스트 마이그레이션 완료, 이메일 구독 서비스 구현 완료

더 자세한 내용은 `RESEND_SETUP.md`를 참고하세요.# Vercel deployment fix Sat Aug 23 19:21:06 KST 2025
