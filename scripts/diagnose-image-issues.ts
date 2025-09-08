#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

interface ImageIssue {
  post: string;
  filePath: string;
  issues: string[];
  brokenImages: string[];
  missingFiles: string[];
}

function getPostSlug(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function extractImageReferences(content: string): string[] {
  const matches = content.match(/!\[.*?\]\(\/images\/([^)]+)\)/g);
  if (!matches) return [];
  
  return matches.map(match => {
    const urlMatch = match.match(/\/images\/([^)]+)/);
    return urlMatch ? urlMatch[1] : '';
  }).filter(Boolean);
}

function checkImageExists(imagePath: string): boolean {
  return fs.existsSync(`public/images/${imagePath}`);
}

function analyzePost(filePath: string): ImageIssue {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = getPostSlug(filePath);
  const images = extractImageReferences(content);
  
  const issues: string[] = [];
  const brokenImages: string[] = [];
  const missingFiles: string[] = [];
  
  // 이미지 파일 존재 여부 확인
  for (const image of images) {
    if (!checkImageExists(image)) {
      missingFiles.push(image);
      issues.push(`Missing file: ${image}`);
    }
  }
  
  // 외부 URL이나 잘못된 참조 확인
  const externalUrls = content.match(/!\[.*?\]\(https?:\/\/[^)]+\)/g);
  if (externalUrls && externalUrls.length > 0) {
    issues.push(`Found ${externalUrls.length} external image URLs`);
    brokenImages.push(...externalUrls);
  }
  
  // hashnode CDN URL 확인 (마이그레이션 누락 가능성)
  const hashnodeUrls = content.match(/!\[.*?\]\([^)]*hashnode[^)]+\)/g);
  if (hashnodeUrls && hashnodeUrls.length > 0) {
    issues.push(`Found ${hashnodeUrls.length} hashnode URLs (not migrated)`);
    brokenImages.push(...hashnodeUrls);
  }
  
  return {
    post: slug,
    filePath,
    issues,
    brokenImages,
    missingFiles
  };
}

function main() {
  const postFiles = globSync('content/posts/*.md');
  const allIssues: ImageIssue[] = [];
  
  console.log('🔍 이미지 문제 진단 중...\n');
  
  for (const postFile of postFiles) {
    const analysis = analyzePost(postFile);
    if (analysis.issues.length > 0) {
      allIssues.push(analysis);
    }
  }
  
  if (allIssues.length === 0) {
    console.log('✅ 모든 이미지가 정상입니다!');
    return;
  }
  
  console.log(`⚠️  문제가 발견된 포스트: ${allIssues.length}개\n`);
  console.log('='.repeat(80));
  
  for (const issue of allIssues) {
    console.log(`\n📝 ${issue.post}`);
    console.log(`   파일: ${issue.filePath}`);
    
    for (const problemDesc of issue.issues) {
      console.log(`   ❌ ${problemDesc}`);
    }
    
    if (issue.missingFiles.length > 0) {
      console.log(`   📂 누락된 파일들:`);
      issue.missingFiles.forEach(file => console.log(`      - ${file}`));
    }
    
    if (issue.brokenImages.length > 0) {
      console.log(`   🔗 문제있는 이미지 참조:`);
      issue.brokenImages.slice(0, 3).forEach(img => {
        console.log(`      - ${img.substring(0, 100)}${img.length > 100 ? '...' : ''}`);
      });
      if (issue.brokenImages.length > 3) {
        console.log(`      ... 및 ${issue.brokenImages.length - 3}개 더`);
      }
    }
  }
  
  // 요약
  const totalMissingFiles = allIssues.reduce((sum, issue) => sum + issue.missingFiles.length, 0);
  const totalBrokenRefs = allIssues.reduce((sum, issue) => sum + issue.brokenImages.length, 0);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 요약:');
  console.log(`   문제가 있는 포스트: ${allIssues.length}개`);
  console.log(`   누락된 이미지 파일: ${totalMissingFiles}개`);
  console.log(`   깨진 이미지 참조: ${totalBrokenRefs}개`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}