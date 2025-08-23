# 배포 가이드

## 현재 상태
✅ **개발 완료**: 모든 핵심 기능 구현 완료  
✅ **테스트 완료**: 68개 포스트 마이그레이션 및 기능 검증 완료  
🚀 **배포 준비**: 도메인 연결만 하면 즉시 서비스 가능  

## 배포 체크리스트

### 1. 환경 변수 설정 ✅
현재 `.env.local`에 설정된 항목들:
```bash
# Notion API (콘텐츠 동기화용)
NOTION_TOKEN=✅ 설정됨
NOTION_DATABASE_ID=✅ 설정됨

# Resend 이메일 서비스  
RESEND_API_KEY=⚠️ 실제 키 필요

# 사이트 설정
NEXT_PUBLIC_SITE_URL=✅ 설정됨
NEXT_PUBLIC_SITE_NAME=✅ 설정됨
NEXT_PUBLIC_SITE_DESCRIPTION=✅ 설정됨

# Giscus 댓글
NEXT_PUBLIC_GISCUS_REPO=✅ 설정됨
NEXT_PUBLIC_GISCUS_REPO_ID=✅ 설정됨
NEXT_PUBLIC_GISCUS_CATEGORY_ID=✅ 설정됨
```

### 2. Vercel 환경 변수 설정
```bash
# Vercel CLI로 환경 변수 추가
vercel env add RESEND_API_KEY
vercel env add NOTION_TOKEN
vercel env add NOTION_DATABASE_ID

# 또는 Vercel 대시보드에서 직접 설정
```

### 3. 프로덕션 배포
```bash
# 최종 빌드 테스트
npm run build

# Vercel 배포
npx vercel --prod
```

## 도메인 설정 단계

### 1. Vercel에서 도메인 추가
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. `sonujung.com` 및 `www.sonujung.com` 추가

### 2. DNS 설정
도메인 관리 업체에서 다음 DNS 레코드 설정:

```dns
# A 레코드 (Vercel IP)
sonujung.com → 76.76.19.61

# CNAME 레코드 (선택사항)
www.sonujung.com → sonujung.com

# 또는 Vercel에서 제공하는 CNAME 사용
sonujung.com → cname.vercel-dns.com
```

### 3. SSL 인증서
Vercel에서 자동으로 Let's Encrypt SSL 인증서 발급

## 서비스별 설정 가이드

### Resend 이메일 서비스
1. **계정 생성**: [resend.com](https://resend.com)
2. **API 키 발급**: Dashboard → API Keys → Create
3. **도메인 인증**: 운영 환경에서는 커스텀 도메인 권장
4. **From 주소 수정**: `src/app/api/subscribe/route.ts`에서 수정

### Giscus 댓글 시스템  
현재 설정 완료, 추가 작업 불필요

### RSS 피드
자동 생성됨: `https://sonujung.com/api/rss`

## 모니터링 설정

### 1. Vercel Analytics
```bash
npm install @vercel/analytics
```

### 2. Google Analytics (선택사항)
Google Tag Manager 설정

### 3. 성능 모니터링
- Vercel Web Analytics 활성화
- Core Web Vitals 모니터링

## 백업 및 복구

### 콘텐츠 백업
```bash
# 마크다운 파일 백업
cp -r content/posts/ backup/posts-$(date +%Y%m%d)/

# Notion 데이터베이스 백업 (스크립트 실행)
npm run sync:notion
```

### GitHub 백업
모든 변경사항은 Git으로 관리되므로 GitHub이 주 백업

## 운영 워크플로우

### 새 포스트 발행
```bash
# 1. Notion에서 포스트 작성
# 2. 로컬에서 동기화
npm run sync:notion

# 3. 확인 후 배포
git add content/posts/
git commit -m "새 포스트: 제목"
git push origin main
```

### 긴급 수정
```bash
# 직접 마크다운 파일 수정
vim content/posts/2024-01-01-post-title.md
git commit -am "긴급 수정: 내용"
git push origin main
```

## 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용 중
- 로컬 이미지 저장으로 로딩 속도 향상

### 캐싱 전략
```bash
# Vercel 자동 캐싱
# 정적 파일: 영구 캐시
# 페이지: ISR 캐시
```

### CDN
Vercel Edge Network를 통한 글로벌 CDN 자동 적용

## 보안 설정

### 환경 변수 보안
- Vercel 환경 변수는 암호화되어 저장
- API 키는 서버 사이드에서만 사용

### CORS 설정
필요 시 Next.js API Routes에서 CORS 헤더 설정

## 트러블슈팅

### 자주 발생하는 문제

1. **빌드 오류**
```bash
# 타입 체크
npm run typecheck

# ESLint 확인  
npm run lint
```

2. **이미지 로딩 문제**
```bash
# 이미지 경로 확인
ls -la content/images/
```

3. **환경 변수 문제**
```bash
# Vercel 환경 변수 확인
vercel env ls
```

## 최종 체크리스트

### 배포 전 확인사항
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 모든 환경 변수 설정 완료
- [ ] Resend API 키 설정
- [ ] DNS 레코드 설정
- [ ] SSL 인증서 발급 확인

### 배포 후 확인사항
- [ ] 홈페이지 로딩 (`https://sonujung.com`)
- [ ] 개별 포스트 접근 (`https://sonujung.com/blog/post-title`)
- [ ] 구독 기능 테스트 (`https://sonujung.com/subscribe`)
- [ ] RSS 피드 확인 (`https://sonujung.com/api/rss`)
- [ ] 댓글 시스템 작동 확인

## 런칭 후 할 일

### 1. 검색 엔진 등록
- Google Search Console
- Bing Webmaster Tools
- 네이버 서치어드바이저

### 2. 사이트맵 제출
자동 생성된 사이트맵 제출: `https://sonujung.com/sitemap.xml`

### 3. 모니터링 대시보드 설정
- Vercel Analytics 확인
- 이메일 구독 현황 모니터링

---

**현재 상태**: 배포 준비 완료 🚀  
**예상 런칭 일정**: DNS 설정 후 즉시 가능  
**소요 시간**: 약 1-2시간 (DNS 전파 시간 포함)