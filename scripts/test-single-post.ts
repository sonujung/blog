#!/usr/bin/env npx ts-node
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('NOTION_TOKEN과 DATABASE_ID 환경변수가 필요합니다.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// 마크다운 텍스트를 노션 블록으로 변환
function parseMarkdownToNotionBlocks(markdown: string): any[] {
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  let currentBlock: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 빈 라인 처리
    if (line.trim() === '') {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // 헤더 처리
    if (line.startsWith('# ')) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
        }
      };
    } else if (line.startsWith('## ')) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: line.substring(3) } }]
        }
      };
    } else if (line.startsWith('### ')) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.substring(4) } }]
        }
      };
    }
    // 이미지 처리
    else if (line.match(/^!\[.*?\]\(.+\)$/)) {
      if (currentBlock) blocks.push(currentBlock);
      const match = line.match(/^!\[(.*?)\]\((.+)\)$/);
      if (match) {
        const [, altText, imageUrl] = match;
        // 로컬 이미지 경로를 GitHub raw URL로 변환
        const fullImageUrl = imageUrl.startsWith('/') 
          ? `https://raw.githubusercontent.com/sonujung/blog/main/public${imageUrl}` 
          : imageUrl;
        
        console.log(`🖼️  이미지 처리: ${altText} -> ${fullImageUrl}`);
        
        currentBlock = {
          type: 'image',
          image: {
            type: 'external',
            external: { url: fullImageUrl },
            caption: altText ? [{ type: 'text', text: { content: altText } }] : []
          }
        };
      }
    }
    // 인용문 처리
    else if (line.startsWith('> ')) {
      if (currentBlock && currentBlock.type !== 'quote') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = {
          type: 'quote',
          quote: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
          }
        };
      } else {
        currentBlock.quote.rich_text.push(
          { type: 'text', text: { content: '\n' + line.substring(2) } }
        );
      }
    }
    // 일반 텍스트 처리
    else {
      if (currentBlock && currentBlock.type !== 'paragraph') {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      if (!currentBlock) {
        currentBlock = {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: line } }]
          }
        };
      } else {
        currentBlock.paragraph.rich_text.push(
          { type: 'text', text: { content: '\n' + line } }
        );
      }
    }
  }

  // 마지막 블록 추가
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

async function uploadSinglePost() {
  try {
    // Luke Jones 포스트 테스트
    const filePath = path.join(process.cwd(), 'content', 'posts', '2015-12-31-critique-about-optical-adjustment-by-luke-jones.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: markdown } = matter(fileContent);
    
    console.log(`📄 테스트 업로드: ${frontMatter.title}`);
    
    // 노션 페이지 생성
    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID! },
      properties: {
        '문서 이름': {
          title: [{ text: { content: `[테스트] ${frontMatter.title}` } }]
        },
        'Author': {
          rich_text: [{ text: { content: frontMatter.author || 'Sonu Jung' } }]
        },
        'slug': {
          rich_text: [{ text: { content: `test-${path.basename(filePath, '.md')}` } }]
        },
        '카테고리': {
          multi_select: frontMatter.tags?.map((tag: string) => ({ name: tag })) || []
        },
        'Created At': {
          date: { start: frontMatter.publishedAt || new Date().toISOString().split('T')[0] }
        }
      }
    });

    // 마크다운 콘텐츠를 노션 블록으로 변환
    const blocks = parseMarkdownToNotionBlocks(markdown);
    
    console.log(`📝 ${blocks.length}개 블록 생성됨`);
    
    // 블록이 너무 많으면 배치로 처리
    const batchSize = 50;
    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      
      await notion.blocks.children.append({
        block_id: page.id,
        children: batch
      });
      
      console.log(`📦 배치 ${Math.floor(i/batchSize) + 1} 업로드 완료`);
      
      // API 제한 방지
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`✅ 테스트 완료: ${frontMatter.title}`);
    console.log(`🔗 노션 페이지 ID: ${page.id}`);
    
  } catch (error) {
    console.error('❌ 테스트 업로드 실패:', error);
  }
}

uploadSinglePost();