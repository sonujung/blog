# Notion 블로그 설정 가이드

## 📋 개요
이 가이드는 Notion을 블로그 CMS로 설정하는 방법을 단계별로 설명합니다.

## 🔧 1단계: Notion Integration 생성

### 1. Notion Developers 페이지 접속
https://www.notion.so/my-integrations

### 2. 새로운 Integration 생성
- **New integration** 클릭
- **Name**: `sonujung.com Blog`
- **Logo**: 선택적
- **Associated workspace**: 개인 워크스페이스 선택
- **Type**: Internal
- **Submit** 클릭

### 3. API Token 복사
생성된 Integration에서 **Internal Integration Token** 복사
→ `.env.local`의 `NOTION_API_TOKEN`에 입력

## 📊 2단계: 블로그 데이터베이스 생성

### 1. 새 페이지 생성
Notion에서 새 페이지 생성 → **Database** 선택 → **Table**

### 2. 데이터베이스 이름 설정
**"Blog Posts"**로 이름 변경

### 3. 필수 속성 추가
다음 속성들을 정확히 추가해야 합니다:

| 속성명 | 타입 | 설정 | 필수 |
|--------|------|------|------|
| **Title** | Title | 기본값 | ✅ |
| **Slug** | Text | - | ✅ |
| **Excerpt** | Text | - | ✅ |
| **Status** | Select | Published, Draft | ✅ |
| **PublishedAt** | Date | - | ✅ |
| **UpdatedAt** | Date | - | ✅ |
| **Tags** | Multi-select | - | ✅ |
| **CoverImage** | Text | - | ⭕ |

### 4. Select 속성 설정

**Status 속성 옵션:**
- `Published` (초록색)
- `Draft` (회색)

**Tags 속성 예시:**
- `개발`
- `JavaScript` 
- `React`
- `Next.js`
- `블로그`

### 5. 데이터베이스 ID 복사

**방법 1: URL에서 추출**
```
https://www.notion.so/workspace/123abc456def789...?v=...
                            ↑ 이 부분이 Database ID
```

**방법 2: Share → Copy link에서 추출**
복사된 링크에서 32자리 영숫자 조합을 찾아 복사

→ `.env.local`의 `NOTION_DATABASE_ID`에 입력

## 🔗 3단계: Integration 권한 설정

### 1. 데이터베이스 페이지에서 우상단 **Share** 클릭

### 2. **Invite** → 생성한 Integration 검색 및 선택

### 3. 권한 설정: **Can edit** 선택

### 4. **Invite** 클릭하여 완료

## ✍️ 4단계: 샘플 포스트 생성

### 샘플 포스트 1
- **Title**: `블로그 런칭!`
- **Slug**: `blog-launch`
- **Excerpt**: `새로운 블로그가 런칭되었습니다. 앞으로 유용한 개발 인사이트를 공유하겠습니다.`
- **Status**: `Published`
- **PublishedAt**: 오늘 날짜
- **UpdatedAt**: 오늘 날짜  
- **Tags**: `블로그`, `일반`

**본문 내용:**
```markdown
# 블로그 런칭!

안녕하세요! 새로운 블로그를 시작하게 되었습니다.

## 블로그 소개

이 블로그에서는 다음과 같은 내용들을 다룰 예정입니다:

- 웹 개발 기술
- 프로그래밍 베스트 프랙티스
- 개발 도구 및 팁
- 개인적인 개발 경험

## 앞으로의 계획

정기적으로 유용한 콘텐츠를 업로드할 예정이니 많은 관심 부탁드립니다!

> 첫 포스트라 다소 간단하지만, 앞으로 더 깊이 있는 내용들로 찾아뵙겠습니다.
```

## 🧪 5단계: 연동 테스트

### 1. 개발 서버 재시작
```bash
npm run dev
```

### 2. 브라우저에서 확인
http://localhost:3000 접속하여 Notion 포스트가 표시되는지 확인

### 3. 실시간 동기화 테스트
1. Notion에서 포스트 수정
2. 브라우저 새로고침하여 변경사항 반영 확인

## 🚨 문제 해결

### API Token이 잘못된 경우
- Integration 페이지에서 토큰 재확인
- `.env.local` 파일 저장 후 개발 서버 재시작

### 데이터베이스를 찾을 수 없는 경우  
- Database ID 재확인
- Integration이 해당 페이지에 초대되었는지 확인

### 포스트가 표시되지 않는 경우
- 포스트 Status가 `Published`인지 확인
- 속성명이 정확한지 확인 (대소문자 구분)

### 한글 깨짐 현상
- Notion 페이지 언어 설정을 한국어로 변경
- 브라우저 인코딩 UTF-8 확인

## 📝 콘텐츠 작성 가이드

### 제목 (Title)
- 명확하고 간결하게
- SEO를 고려한 키워드 포함

### 슬러그 (Slug)  
- 영문, 숫자, 하이픈(-)만 사용
- 소문자 권장
- 예시: `react-hooks-guide`, `nextjs-deployment`

### 요약 (Excerpt)
- 1-2문장으로 포스트 핵심 요약
- 검색 결과와 소셜 미디어에서 표시

### 태그 (Tags)
- 3-5개 내외로 제한
- 일관된 태그명 사용
- 한글/영문 혼용 가능

### 본문 작성 팁
- 마크다운 문법 활용
- 코드 블록, 인용문 적극 활용
- 적절한 제목 레벨 (H1, H2, H3) 구성

## ✅ 체크리스트

설정 완료 후 다음 항목들을 확인하세요:

- [ ] Notion Integration 생성 및 토큰 복사
- [ ] Blog Posts 데이터베이스 생성
- [ ] 필수 속성 8개 정확히 추가
- [ ] Integration 권한 부여
- [ ] 환경 변수 설정 (.env.local)
- [ ] 샘플 포스트 작성
- [ ] 로컬 테스트 성공
- [ ] 실시간 동기화 확인

모든 항목이 완료되면 블로그가 Notion과 완전히 연동됩니다! 🎉