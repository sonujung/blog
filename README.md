# sonujung.com 블로그

학구적이고 미니멀한 개발 블로그 - Next.js 14 + Notion CMS + Vercel

## 🎯 특징

- **뉴욕 스타일 에디토리얼 디자인**: 카드 없는 목록 형태의 미니멀한 레이아웃
- **Pretendard 폰트**: 한글 최적화된 산세리프 타이포그래피
- **Notion CMS**: 노션에서 글쓰기, 자동으로 블로그에 반영
- **완전 무료**: Vercel 호스팅 + GitHub + 무료 서비스들만 사용
- **Hashnode 마이그레이션**: 기존 콘텐츠 자동 이전 스크립트 포함

## 🚀 기능

### 핵심 기능
- ✅ 블로그 포스트 목록 및 상세 페이지
- ✅ 실시간 검색 (Fuse.js)
- ✅ 태그 기반 분류
- ✅ RSS 피드 생성
- ✅ 뉴스레터 구독
- ✅ 댓글 시스템 (Giscus)
- ✅ SEO 최적화 (메타데이터, 사이트맵, robots.txt)

## 🛠 기술 스택

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **Pretendard Font**
- **Notion API** (콘텐츠 관리)
- **Vercel** (호스팅 + 이미지 최적화)
- **Giscus** (GitHub 기반 댓글)

## 📦 설치 및 실행

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local`에 다음 값들을 설정:
```
NOTION_API_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
HASHNODE_HOSTNAME=your-blog.hashnode.dev
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 🔄 Hashnode 마이그레이션

```bash
npm run migrate:hashnode
```

## 🚀 배포

```bash
npx vercel --prod
```

Vercel에서 환경 변수 설정 후 `sonujung.com` 커스텀 도메인 연결

---

더 자세한 내용은 `/docs/Requirements.md`와 `/docs/Architecture.md`를 참고하세요.
