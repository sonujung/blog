#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

interface ImageSequence {
  post: string;
  filePath: string;
  imageCount: number;
  sequence: number[];
  gaps: number[];
  potentialIssues: string[];
}

function getPostSlug(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function extractImageSequence(content: string, slug: string): number[] {
  const pattern = new RegExp(`!\\[.*?\\]\\(/images/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-img-(\\d+)\\.[^)]+\\)`, 'g');
  const matches = [];
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    matches.push(parseInt(match[1]));
  }
  
  return matches.sort((a, b) => a - b);
}

function findGapsInSequence(sequence: number[]): number[] {
  const gaps: number[] = [];
  
  if (sequence.length === 0) return gaps;
  
  for (let i = 0; i < sequence.length - 1; i++) {
    const current = sequence[i];
    const next = sequence[i + 1];
    
    if (next - current > 1) {
      for (let missing = current + 1; missing < next; missing++) {
        gaps.push(missing);
      }
    }
  }
  
  return gaps;
}

function analyzeImageSequence(filePath: string): ImageSequence {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = getPostSlug(filePath);
  const sequence = extractImageSequence(content, slug);
  const gaps = findGapsInSequence(sequence);
  const potentialIssues: string[] = [];
  
  // 문제 패턴 탐지
  if (sequence.length > 0 && sequence[0] !== 1) {
    potentialIssues.push(`First image is not img-1 (starts with img-${sequence[0]})`);
  }
  
  if (gaps.length > 0) {
    potentialIssues.push(`Missing images: img-${gaps.join(', img-')}`);
  }
  
  // 사용 가능한 이미지 파일과 비교
  const availableImages = globSync(`public/images/${slug}-img-*.{png,jpg,jpeg,gif,svg}`);
  const availableNumbers = availableImages.map(file => {
    const match = path.basename(file).match(/-img-(\d+)\./);
    return match ? parseInt(match[1]) : 0;
  }).filter(n => n > 0).sort((a, b) => a - b);
  
  const unusedImages = availableNumbers.filter(n => !sequence.includes(n));
  if (unusedImages.length > 0) {
    potentialIssues.push(`Unused image files: img-${unusedImages.join(', img-')}`);
  }
  
  return {
    post: slug,
    filePath,
    imageCount: sequence.length,
    sequence,
    gaps,
    potentialIssues
  };
}

function main() {
  const postFiles = globSync('content/posts/*.md');
  const analyses: ImageSequence[] = [];
  
  console.log('🔢 이미지 순서 및 일관성 확인 중...\n');
  
  for (const postFile of postFiles) {
    const analysis = analyzeImageSequence(postFile);
    if (analysis.imageCount > 0) { // 이미지가 있는 포스트만
      analyses.push(analysis);
    }
  }
  
  // 문제가 있는 포스트들 필터링
  const problematicPosts = analyses.filter(a => a.potentialIssues.length > 0);
  
  console.log(`📊 분석 결과:`);
  console.log(`   이미지가 있는 포스트: ${analyses.length}개`);
  console.log(`   잠재적 문제가 있는 포스트: ${problematicPosts.length}개\n`);
  
  if (problematicPosts.length === 0) {
    console.log('✅ 모든 이미지 순서가 정상입니다!');
    
    // 이미지가 많은 포스트들 상위 5개 표시
    const topImagePosts = analyses
      .sort((a, b) => b.imageCount - a.imageCount)
      .slice(0, 5);
      
    console.log('\n🖼️ 이미지가 가장 많은 포스트들:');
    topImagePosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.post} (${post.imageCount}개 이미지)`);
    });
    
    return;
  }
  
  console.log('⚠️ 문제가 발견된 포스트들:');
  console.log('='.repeat(80));
  
  for (const post of problematicPosts) {
    console.log(`\n📝 ${post.post} (${post.imageCount}개 이미지)`);
    
    for (const issue of post.potentialIssues) {
      console.log(`   ❌ ${issue}`);
    }
    
    if (post.sequence.length > 0) {
      console.log(`   📋 현재 순서: img-${post.sequence.join(', img-')}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}