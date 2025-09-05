#!/usr/bin/env npx ts-node
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('NOTION_TOKEN과 DATABASE_ID 환경변수가 필요합니다.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// 이미지를 노션에 업로드하고 URL을 반환
async function uploadImageToNotion(imagePath: string, pageId: string): Promise<string | null> {
  try {
    console.log(`🖼️  이미지 업로드 중: ${path.basename(imagePath)}`);
    
    // 이미지 파일을 읽어서 base64로 인코딩
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // 파일 확장자에 따른 MIME 타입 설정
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/png';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.svg') {
      mimeType = 'image/svg+xml';
    } else if (ext === '.gif') {
      mimeType = 'image/gif';
    }
    
    // Data URL 생성
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    // 노션에 이미지 블록 추가
    const response = await notion.blocks.children.append({
      block_id: pageId,
      children: [{
        type: 'image',
        image: {
          type: 'external',
          external: {
            url: dataUrl
          },
          caption: []
        }
      }]
    });
    
    console.log(`✅ 이미지 업로드 성공: ${path.basename(imagePath)}`);
    return dataUrl;
    
  } catch (error) {
    console.error(`❌ 이미지 업로드 실패 (${path.basename(imagePath)}):`, error);
    return null;
  }
}

// 마크다운을 노션 블록으로 변환 (이미지는 별도 처리)
function parseMarkdownToNotionBlocks(markdown: string, imagePaths: Map<string, string>): any[] {
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
    // 이미지 처리 - 플레이스홀더로 대체 (실제 업로드는 나중에)
    else if (line.match(/^!\[.*?\]\(.+\)$/)) {
      if (currentBlock) blocks.push(currentBlock);
      const match = line.match(/^!\[(.*?)\]\((.+)\)$/);
      if (match) {
        const [, altText, imageUrl] = match;
        
        // 이미지 플레이스홀더 블록
        currentBlock = {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ 
              type: 'text', 
              text: { content: `[이미지: ${altText || '이미지'}]` },
              annotations: { italic: true, color: 'gray' }
            }]
          }
        };
        
        // 이미지 경로 저장
        if (imageUrl.startsWith('/images/')) {
          const imagePath = path.join(process.cwd(), 'public', imageUrl);
          if (fs.existsSync(imagePath)) {
            imagePaths.set(line, imagePath);
          }
        }
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

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
}

async function uploadSinglePostWithImages() {
  try {
    // Luke Jones 포스트 테스트
    const filePath = path.join(process.cwd(), 'content', 'posts', '2015-12-31-critique-about-optical-adjustment-by-luke-jones.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: markdown } = matter(fileContent);
    
    console.log(`📄 업로드 시작: ${frontMatter.title}`);
    
    // 이미지 경로 수집
    const imagePaths = new Map<string, string>();
    
    // 노션 페이지 생성
    const page = await notion.pages.create({
      parent: { database_id: DATABASE_ID! },
      properties: {
        '문서 이름': {
          title: [{ text: { content: `[이미지테스트] ${frontMatter.title}` } }]
        },
        'Author': {
          rich_text: [{ text: { content: frontMatter.author || 'Sonu Jung' } }]
        },
        'slug': {
          rich_text: [{ text: { content: `imgtest-${path.basename(filePath, '.md')}` } }]
        },
        '카테고리': {
          multi_select: frontMatter.tags?.map((tag: string) => ({ name: tag })) || []
        },
        'Created At': {
          date: { start: frontMatter.publishedAt || new Date().toISOString().split('T')[0] }
        }
      }
    });

    console.log(`✅ 페이지 생성됨: ${page.id}`);

    // 마크다운 콘텐츠를 노션 블록으로 변환
    const blocks = parseMarkdownToNotionBlocks(markdown, imagePaths);
    
    console.log(`📝 ${blocks.length}개 블록 생성, ${imagePaths.size}개 이미지 발견`);
    
    // 텍스트 블록 먼저 업로드
    const batchSize = 50;
    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      
      await notion.blocks.children.append({
        block_id: page.id,
        children: batch
      });
      
      console.log(`📦 텍스트 배치 ${Math.floor(i/batchSize) + 1} 업로드 완료`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 이미지들을 하나씩 업로드
    console.log('\n🖼️  이미지 업로드 시작...');
    
    for (const [imageMarkdown, imagePath] of imagePaths.entries()) {
      await uploadImageToNotion(imagePath, page.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // 이미지 업로드는 더 여유있게
    }
    
    console.log(`\n🎉 업로드 완료: ${frontMatter.title}`);
    console.log(`🔗 노션 페이지 ID: ${page.id}`);
    
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
  }
}

uploadSinglePostWithImages();