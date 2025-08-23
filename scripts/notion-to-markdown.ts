import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: '.env.local' });

// 환경변수에서 Notion 설정 불러오기
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('NOTION_TOKEN과 DATABASE_ID 환경변수가 필요합니다.');
  console.error('현재 값:', { NOTION_TOKEN: NOTION_TOKEN ? '설정됨' : '없음', DATABASE_ID: DATABASE_ID ? '설정됨' : '없음' });
  process.exit(1);
}

// Notion 클라이언트 초기화
const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 디렉토리 생성
const postsDir = path.join(process.cwd(), 'content', 'posts');

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Notion 속성 값 추출 함수
function getPropertyValue(property: any): string {
  if (!property) return '';
  
  switch (property.type) {
    case 'title':
      return property.title?.map((t: any) => t.plain_text).join('') || '';
    case 'rich_text':
      return property.rich_text?.map((t: any) => t.plain_text).join('') || '';
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map((s: any) => s.name).join(',') || '';
    case 'date':
      return property.date?.start || '';
    case 'people':
      return property.people?.map((p: any) => p.name).join(', ') || '';
    case 'checkbox':
      return property.checkbox ? 'true' : 'false';
    default:
      return '';
  }
}

// 이미지 다운로드는 제거됨 - 외부 CDN 이미지를 직접 참조

// 이미지 URL 처리 - Hashnode CDN은 외부 링크로 유지
async function processImages(markdown: string): Promise<string> {
  // Notion의 [Image: filename] 패턴을 실제 이미지 URL로 변환
  const notionImageRegex = /\[Image:\s*([^\]]+)\]/g;
  let processedMarkdown = markdown;
  
  // [Image: filename] 패턴을 제거 (Notion에서 제대로 변환되지 않은 경우)
  processedMarkdown = processedMarkdown.replace(notionImageRegex, '');
  
  // 실제 이미지 마크다운 패턴 처리
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const [fullMatch, altText, imageUrl] = match;
    
    // Hashnode CDN 이미지는 외부 링크로 그대로 유지
    if (imageUrl.includes('cdn.hashnode.com') || imageUrl.includes('hashnode.com')) {
      // 외부 이미지는 그대로 유지
      continue;
    }
    
    // 기타 외부 이미지도 그대로 유지 (Notion 내부 이미지만 다운로드)
    if (!imageUrl.includes('notion.so') && !imageUrl.includes('notion.com')) {
      continue;
    }
    
    // Notion 내부 이미지도 그대로 유지 (다운로드하지 않음)
    // 모든 외부 이미지는 원본 URL 그대로 사용
  }

  return processedMarkdown;
}

// 메인 동기화 함수
async function syncNotionToMarkdown() {
  try {
    console.log('📚 Notion에서 포스트 목록 가져오는 중...');
    
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      sorts: [
        { property: 'Created At', direction: 'descending' }
      ]
    });

    console.log(`✅ ${response.results.length}개 포스트 발견`);

    for (const page of response.results) {
      if (page.object !== 'page') continue;
      
      // 타입 가드로 전체 페이지인지 확인
      const fullPage = page as any;
      if (!fullPage.properties) continue;

      const pageId = page.id;
      const properties = fullPage.properties;

      // 기본 정보 추출 (실제 Notion 속성명 사용)
      const title = getPropertyValue(properties['문서 이름']) || 'Untitled';
      const publishedAt = getPropertyValue(properties['Created At']) || fullPage.created_time || new Date().toISOString();
      const updatedAt = fullPage.last_edited_time || new Date().toISOString();
      const author = getPropertyValue(properties['Author']) || 'Sonu Jung';
      const tags = getPropertyValue(properties['카테고리']) || '';
      const slug = getPropertyValue(properties['slug']) || title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').substring(0, 50);

      // 커버 이미지 추출
      let coverImage = '';
      if (fullPage.cover) {
        if (fullPage.cover.type === 'external') {
          coverImage = fullPage.cover.external.url;
        } else if (fullPage.cover.type === 'file') {
          coverImage = fullPage.cover.file.url;
        }
      }

      console.log(`📄 처리 중: ${title}`);

      try {
        // Notion 페이지를 마크다운으로 변환
        const mdBlocks = await n2m.pageToMarkdown(pageId);
        let markdown = n2m.toMarkdownString(mdBlocks).parent;

        // 이미지 처리
        markdown = await processImages(markdown);

        // Frontmatter 생성
        const frontmatter = `---
title: "${title}"
publishedAt: "${publishedAt.split('T')[0]}"
updatedAt: "${updatedAt.split('T')[0]}"
author: "${author}"
tags: [${tags.split(',').map((tag: string) => `"${tag.trim()}"`).join(', ')}]
excerpt: ""${coverImage ? `\ncoverImage: "${coverImage}"` : ''}
---

${markdown}`;

        // 파일명 생성 (날짜-slug 형식)
        const fileName = `${publishedAt.split('T')[0]}-${slug}.md`;
        const filePath = path.join(postsDir, fileName);

        // 파일 저장
        fs.writeFileSync(filePath, frontmatter, 'utf8');
        console.log(`✅ 저장 완료: ${fileName}`);

      } catch (error) {
        console.error(`❌ ${title} 처리 중 오류:`, error);
      }

      // API 제한 방지를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎉 동기화 완료!');
  } catch (error) {
    console.error('❌ 동기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
syncNotionToMarkdown();