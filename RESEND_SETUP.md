# Resend 이메일 서비스 설정 가이드

## 1. Resend 계정 생성
1. [resend.com](https://resend.com) 접속
2. "Sign up" 버튼 클릭하여 계정 생성
3. 이메일 인증 완료

## 2. API 키 생성
1. Resend 대시보드에서 "API Keys" 메뉴 선택
2. "Create API Key" 버튼 클릭
3. 키 이름 입력 (예: "sonujung-blog")
4. 권한: "Sending access" 선택 (기본값)
5. 생성된 API 키 복사 (한 번만 표시됨!)

## 3. 도메인 설정 (옵션 - 운영 환경용)
### 개발/테스트용
- 기본 제공 도메인 `onboarding@resend.dev` 사용 가능
- 월 100개 이메일 제한

### 운영용 (권장)
1. "Domains" 메뉴에서 "Add Domain" 클릭
2. `sonujung.com` 입력
3. DNS 설정 값들을 도메인 제공업체에 추가:
   ```
   TXT _resend.sonujung.com "generated_value"
   MX sonujung.com resend.mail.
   CNAME mail.sonujung.com mail.resend.com
   ```
4. DNS 인증 완료 후 커스텀 발신 주소 사용 가능

## 4. Audience 생성
1. Resend 대시보드에서 "Audiences" 메뉴 선택
2. "Create Audience" 클릭 후 이름 입력 (예: "blog-newsletter")
3. 생성된 Audience의 ID(`aud_...` 형태)를 복사
4. 이 ID가 구독자 목록 관리에 사용됩니다

## 5. 환경 변수 설정
`.env.local` 파일에 다음 값을 추가합니다:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_AUDIENCE_ID=aud_your_audience_id
# 필요 시 커스텀 발신 주소 설정 (선택)
RESEND_FROM_EMAIL="Sonu Jung <onboarding@resend.dev>"
```

## 6. 테스트
1. 개발 서버 재시작: `npm run dev`
2. `/subscribe` 페이지에서 이메일 주소 입력하여 테스트
3. 입력한 이메일 받은함 확인

## 7. 운영 배포 시 추가 설정
### Vercel 환경 변수
```bash
vercel env add RESEND_API_KEY
vercel env add RESEND_AUDIENCE_ID
vercel env add RESEND_FROM_EMAIL  # 선택 사항
```

### 이메일 From 주소
- 커스텀 도메인 인증이 완료되면 `RESEND_FROM_EMAIL`을 `noreply@your-domain.com` 등의 주소로 설정하세요.
- 설정하지 않으면 기본값으로 `onboarding@resend.dev`가 사용됩니다.

## 무료 플랜 제한
- 월 3,000개 이메일
- 일일 100개 이메일 
- 구독자 관리 기능 제한적

월 3,000개면 개인 블로그용으로는 충분합니다! 🚀
