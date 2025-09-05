#!/usr/bin/env npx ts-node
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('NOTION_TOKEN과 DATABASE_ID 환경변수가 필요합니다.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const postsDir = path.join(process.cwd(), 'content', 'posts');
const protectedPostsFile = path.join(process.cwd(), 'protected-posts.json');

// 보호된 포스트 목록 로드/저장
function loadProtectedPosts(): Set<string> {
  if (fs.existsSync(protectedPostsFile)) {
    const data = JSON.parse(fs.readFileSync(protectedPostsFile, 'utf-8'));
    return new Set(data.protectedSlugs || []);
  }
  return new Set();
}

function saveProtectedPosts(protectedSlugs: Set<string>) {
  const data = {
    protectedSlugs: Array.from(protectedSlugs),
    lastUpdated: new Date().toISOString(),
    description: "이 파일에 나열된 slug들은 노션 동기화에서 제외됩니다."
  };
  fs.writeFileSync(protectedPostsFile, JSON.stringify(data, null, 2), 'utf-8');
}

// 현재 존재하는 마크다운 포스트들을 보호 목록에 추가
function protectExistingPosts() {
  console.log('📋 현재 존재하는 마크다운 포스트들을 보호 목록에 추가...');
  
  const protectedSlugs = loadProtectedPosts();
  const mdFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  let newlyProtected = 0;
  
  for (const file of mdFiles) {
    const slug = path.basename(file, '.md');
    if (!protectedSlugs.has(slug)) {
      protectedSlugs.add(slug);
      newlyProtected++;
      console.log(`🛡️  보호 추가: ${slug}`);
    }
  }
  
  saveProtectedPosts(protectedSlugs);
  
  console.log(`\n✅ 보호 완료!`);
  console.log(`📊 총 보호된 포스트: ${protectedSlugs.size}개`);
  console.log(`🆕 새로 보호된 포스트: ${newlyProtected}개`);
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

// 이미지 처리 - 노션 이미지는 그대로 유지
async function processImages(markdown: string): Promise<string> {
  // Notion의 [Image: filename] 패턴을 제거
  const notionImageRegex = /\[Image:\s*([^\]]+)\]/g;
  let processedMarkdown = markdown.replace(notionImageRegex, '');
  
  return processedMarkdown;
}

// 선택적 노션 동기화
async function selectiveNotionSync() {
  try {
    const protectedSlugs = loadProtectedPosts();
    console.log(`🛡️  보호된 포스트: ${protectedSlugs.size}개`);
    
    console.log('📚 Notion에서 포스트 목록 가져오는 중...');
    
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      sorts: [
        { property: 'Created At', direction: 'descending' }
      ]
    });

    console.log(`✅ ${response.results.length}개 포스트 발견`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const page of response.results) {
      if (page.object !== 'page') continue;
      
      const fullPage = page as any;
      if (!fullPage.properties) continue;

      const pageId = page.id;
      const properties = fullPage.properties;

      // 기본 정보 추출
      const title = getPropertyValue(properties['문서 이름']) || 'Untitled';
      const publishedAt = getPropertyValue(properties['Created At']) || fullPage.created_time || new Date().toISOString();
      const updatedAt = fullPage.last_edited_time || new Date().toISOString();
      const author = getPropertyValue(properties['Author']) || 'Sonu Jung';
      const tags = getPropertyValue(properties['카테고리']) || '';
      const slug = getPropertyValue(properties['slug']) || title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').substring(0, 50);

      // 보호된 포스트인지 확인
      const fileName = `${publishedAt.split('T')[0]}-${slug}.md`;
      const fullSlug = path.basename(fileName, '.md');
      
      if (protectedSlugs.has(fullSlug)) {
        console.log(`🛡️  건너뛰기 (보호됨): ${title}`);
        skippedCount++;
        continue;
      }

      // 커버 이미지 추출
      let coverImage = '';
      if (fullPage.cover) {
        if (fullPage.cover.type === 'external') {
          coverImage = fullPage.cover.external.url;
        } else if (fullPage.cover.type === 'file') {
          coverImage = fullPage.cover.file.url;
        }
      }

      console.log(`📄 동기화 중: ${title}`);

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

        // 파일 저장
        const filePath = path.join(postsDir, fileName);
        fs.writeFileSync(filePath, frontmatter, 'utf8');
        console.log(`✅ 저장 완료: ${fileName}`);
        syncedCount++;

      } catch (error) {
        console.error(`❌ ${title} 처리 중 오류:`, error);
      }

      // API 제한 방지
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 선택적 동기화 완료!');
    console.log(`📊 결과:`);
    console.log(`  - 동기화됨: ${syncedCount}개`);
    console.log(`  - 보호로 건너뜀: ${skippedCount}개`);
    console.log(`  - 총 보호된 포스트: ${protectedSlugs.size}개`);
  } catch (error) {
    console.error('❌ 동기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// CLI 명령어 처리
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'protect':
      protectExistingPosts();
      break;
    case 'sync':
      await selectiveNotionSync();
      break;
    case 'list':
      const protectedPosts = loadProtectedPosts();
      console.log(`🛡️  보호된 포스트 목록 (${protectedPosts.size}개):`);
      protectedPosts.forEach(slug => console.log(`  - ${slug}`));
      break;
    default:
      console.log(`사용법:
  npm run sync:selective protect  # 현재 포스트들을 보호 목록에 추가
  npm run sync:selective sync     # 보호된 포스트를 제외하고 노션 동기화
  npm run sync:selective list     # 보호된 포스트 목록 확인`);
  }
}

main().catch(console.error);