#!/usr/bin/env ts-node

import * as fs from 'fs';
import { globSync } from 'glob';

// 이미지 배치에서 잠재적 문제를 탐지하는 스크립트

function getPostSlug(filePath: string): string {
  const basename = filePath.split('/').pop()?.replace('.md', '') || '';
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function analyzeImagePlacement(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const slug = getPostSlug(filePath);
  
  const issues: string[] = [];
  const imageLines: number[] = [];
  
  // 이미지가 있는 라인들 찾기
  lines.forEach((line, index) => {
    if (line.match(/!\[Image \d+\]/)) {
      imageLines.push(index);
    }
  });
  
  if (imageLines.length === 0) return null;
  
  // 문제 패턴 탐지
  
  // 1. 연속된 이미지들 (2줄 이내)
  for (let i = 0; i < imageLines.length - 1; i++) {
    if (imageLines[i + 1] - imageLines[i] <= 2) {
      issues.push(`Images ${i + 1} and ${i + 2} are too close (lines ${imageLines[i] + 1} and ${imageLines[i + 1] + 1})`);
    }
  }
  
  // 2. 문단 시작 부분에 이미지 (앞의 2줄이 모두 비어있거나 제목)
  for (const imageLineIndex of imageLines) {
    const prevLine1 = lines[imageLineIndex - 1] || '';
    const prevLine2 = lines[imageLineIndex - 2] || '';
    
    if (prevLine1.trim() === '' && prevLine2.trim() === '') {
      issues.push(`Image at line ${imageLineIndex + 1} might be misplaced (isolated from text)`);
    }
  }
  
  // 3. 글 맨 끝에 몰려있는 이미지들
  const lastTextLineIndex = lines.length - 1;
  const endImages = imageLines.filter(lineIdx => lastTextLineIndex - lineIdx < 10).length;
  if (endImages > 1) {
    issues.push(`${endImages} images clustered near the end of the post`);
  }
  
  // 4. 한 단락에 너무 많은 이미지
  for (let i = 0; i < imageLines.length - 2; i++) {
    const range = imageLines[i + 2] - imageLines[i];
    if (range < 10) { // 10줄 이내에 3개 이상의 이미지
      issues.push(`Too many images in small range (lines ${imageLines[i] + 1}-${imageLines[i + 2] + 1})`);
    }
  }
  
  return {
    slug,
    filePath,
    imageCount: imageLines.length,
    issues,
    imageLines: imageLines.map(l => l + 1) // 1-based line numbers
  };
}

function main() {
  const postFiles = globSync('content/posts/*.md');
  const problematicPosts: any[] = [];
  
  console.log('🔍 이미지 배치 문제 탐지 중...\n');
  
  for (const postFile of postFiles) {
    const analysis = analyzeImagePlacement(postFile);
    
    if (analysis && analysis.issues.length > 0) {
      problematicPosts.push(analysis);
    }
  }
  
  if (problematicPosts.length === 0) {
    console.log('✅ 모든 포스트의 이미지 배치가 정상으로 보입니다.');
    return;
  }
  
  console.log(`⚠️ 잠재적 이미지 배치 문제가 있는 포스트: ${problematicPosts.length}개\n`);
  console.log('='.repeat(80));
  
  // 문제가 많은 순으로 정렬
  problematicPosts.sort((a, b) => b.issues.length - a.issues.length);
  
  for (const post of problematicPosts.slice(0, 10)) { // 상위 10개만
    console.log(`\n📝 ${post.slug} (${post.imageCount}개 이미지)`);
    console.log(`   이미지 위치: 라인 ${post.imageLines.join(', ')}`);
    
    for (const issue of post.issues) {
      console.log(`   ❌ ${issue}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('💡 이 결과는 참고용입니다. 실제 문제 여부는 브라우저에서 확인해주세요.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}