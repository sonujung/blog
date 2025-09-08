#!/usr/bin/env ts-node

import * as fs from 'fs';
import { globSync } from 'glob';

// 원본 사이트와 로컬 포스트의 이미지 위치를 비교하는 스크립트
// 우선 로컬 포스트들의 이미지 위치를 분석하여 패턴을 찾아봅시다

function getPostSlug(filePath: string): string {
  const basename = filePath.split('/').pop()?.replace('.md', '') || '';
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function analyzeImagePositions(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const slug = getPostSlug(filePath);
  
  const imagePositions: Array<{line: number, imageRef: string, context: string}> = [];
  
  lines.forEach((line, index) => {
    const imageMatch = line.match(/!\[Image (\d+)\]\(\/images\/([^)]+)\)/);
    if (imageMatch) {
      const contextBefore = lines[Math.max(0, index - 2)]?.substring(0, 100) || '';
      const contextAfter = lines[Math.min(lines.length - 1, index + 2)]?.substring(0, 100) || '';
      
      imagePositions.push({
        line: index + 1,
        imageRef: imageMatch[0],
        context: `...${contextBefore}... [IMAGE] ...${contextAfter}...`
      });
    }
  });
  
  return {
    slug,
    filePath,
    imageCount: imagePositions.length,
    positions: imagePositions
  };
}

function main() {
  // 특정 포스트들을 중점적으로 분석
  const targetPosts = [
    'content/posts/2015-01-15-thoughts-about-design-agency.md',
    'content/posts/2016-10-25-humans-vs-chatbots.md',
    'content/posts/2016-04-13-kpcb-designin-tech-report-2016.md',
    'content/posts/2017-04-21-history-of-product-design.md'
  ];
  
  console.log('🔍 주요 포스트들의 이미지 위치 분석\n');
  console.log('=' .repeat(80));
  
  for (const postPath of targetPosts) {
    if (fs.existsSync(postPath)) {
      const analysis = analyzeImagePositions(postPath);
      
      console.log(`\n📝 ${analysis.slug} (${analysis.imageCount}개 이미지)`);
      console.log(`   파일: ${analysis.filePath}`);
      
      if (analysis.positions.length > 0) {
        console.log('   이미지 위치:');
        analysis.positions.forEach((pos, index) => {
          console.log(`   ${index + 1}. 라인 ${pos.line}: ${pos.imageRef}`);
          console.log(`      컨텍스트: ${pos.context.replace(/\s+/g, ' ')}`);
        });
      } else {
        console.log('   ❌ 이미지 없음');
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 권장사항:');
  console.log('1. 브라우저에서 원본과 로컬을 직접 비교해보세요');
  console.log('2. 특히 thoughts-about-design-agency 포스트를 확인해보세요');
  console.log('3. 원본: https://sonu.hashnode.dev/thoughts-about-design-agency');
  console.log('4. 로컬: http://localhost:3003/thoughts-about-design-agency');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}