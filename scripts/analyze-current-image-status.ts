#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

interface ImageAnalysis {
  slug: string;
  filePath: string;
  referencedImages: number;
  availableImages: number;
  hasIssue: boolean;
}

function getPostSlug(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function countImageReferences(content: string): number {
  const matches = content.match(/!\[.*?\]\(\/images\/.*?\)/g);
  return matches ? matches.length : 0;
}

function countAvailableImages(slug: string): number {
  const patterns = [
    `public/images/${slug}-img-*.png`,
    `public/images/${slug}-img-*.jpg`,
    `public/images/${slug}-img-*.jpeg`,
    `public/images/${slug}-img-*.gif`,
    `public/images/${slug}-img-*.svg`
  ];
  
  let files: string[] = [];
  patterns.forEach(pattern => {
    files = files.concat(globSync(pattern));
  });
  
  return files.length;
}

function main() {
  const postFiles = globSync('content/posts/*.md');
  const analyses: ImageAnalysis[] = [];
  
  console.log('🔍 현재 이미지 상태 분석 중...\n');
  
  for (const postFile of postFiles) {
    const content = fs.readFileSync(postFile, 'utf-8');
    const slug = getPostSlug(postFile);
    const referencedImages = countImageReferences(content);
    const availableImages = countAvailableImages(slug);
    
    const analysis: ImageAnalysis = {
      slug,
      filePath: postFile,
      referencedImages,
      availableImages,
      hasIssue: availableImages > 0 && referencedImages === 0
    };
    
    analyses.push(analysis);
  }
  
  // 문제가 있는 포스트들 출력
  const problematicPosts = analyses.filter(a => a.hasIssue);
  
  console.log('❌ 이미지 파일은 있지만 참조가 없는 포스트들:');
  console.log('='.repeat(60));
  
  if (problematicPosts.length === 0) {
    console.log('✅ 모든 포스트가 정상입니다!');
  } else {
    problematicPosts.forEach(post => {
      console.log(`📝 ${post.slug}`);
      console.log(`   파일: ${post.filePath}`);
      console.log(`   참조된 이미지: ${post.referencedImages}개`);
      console.log(`   사용가능 이미지: ${post.availableImages}개`);
      console.log('');
    });
  }
  
  // 통계
  const totalWithImages = analyses.filter(a => a.availableImages > 0).length;
  const totalWithReferences = analyses.filter(a => a.referencedImages > 0).length;
  
  console.log('📊 전체 통계:');
  console.log(`   총 포스트: ${analyses.length}개`);
  console.log(`   이미지 파일이 있는 포스트: ${totalWithImages}개`);
  console.log(`   이미지 참조가 있는 포스트: ${totalWithReferences}개`);
  console.log(`   문제가 있는 포스트: ${problematicPosts.length}개`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}