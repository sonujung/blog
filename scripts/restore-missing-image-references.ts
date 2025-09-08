#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

interface PostInfo {
  filePath: string;
  slug: string;
  content: string;
  currentImages: string[];
  availableImages: string[];
  missingImages: string[];
}

function getPostSlug(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  // 날짜 부분 제거 (YYYY-MM-DD-)
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function getCurrentImageReferences(content: string, slug: string): string[] {
  const pattern = new RegExp(`!\\[.*?\\]\\(/images/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-img-\\d+\\.[^)]+\\)`, 'g');
  const matches = content.match(pattern) || [];
  return matches.map(match => {
    const urlMatch = match.match(/\/images\/([^)]+)/);
    return urlMatch ? urlMatch[1] : '';
  }).filter(Boolean);
}

function getAvailableImages(slug: string): string[] {
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
  
  return files.map(filePath => path.basename(filePath)).sort((a, b) => {
    const aNum = parseInt(a.match(/-img-(\d+)\./)?.[1] || '0');
    const bNum = parseInt(b.match(/-img-(\d+)\./)?.[1] || '0');
    return aNum - bNum;
  });
}

function addMissingImages(content: string, slug: string, missingImages: string[]): string {
  if (missingImages.length === 0) return content;
  
  // 마지막에 이미지들을 추가
  let updatedContent = content.trim();
  
  // 기존 이미지가 있으면 그 뒤에, 없으면 본문 끝에 추가
  const lastImageIndex = content.lastIndexOf(`![Image`);
  
  missingImages.forEach((imageFile, index) => {
    const imageNumber = imageFile.match(/-img-(\d+)\./)?.[1] || '1';
    const imageMarkdown = `![Image ${imageNumber}](/images/${imageFile})`;
    
    updatedContent += `\n\n${imageMarkdown}`;
  });
  
  return updatedContent;
}

function analyzePost(filePath: string): PostInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = getPostSlug(filePath);
  const currentImages = getCurrentImageReferences(content, slug);
  const availableImages = getAvailableImages(slug);
  
  // 현재 참조된 이미지들을 제외한 누락된 이미지들 찾기
  const missingImages = availableImages.filter(img => 
    !currentImages.includes(img)
  );
  
  return {
    filePath,
    slug,
    content,
    currentImages,
    availableImages,
    missingImages
  };
}

function main() {
  const postsPattern = 'content/posts/*.md';
  const postFiles = globSync(postsPattern);
  
  console.log('📸 누락된 이미지 참조 복구 시작...\n');
  console.log(`📁 찾은 포스트 파일: ${postFiles.length}개\n`);
  
  let totalProcessed = 0;
  let totalImagesAdded = 0;
  
  for (const postFile of postFiles) {
    const postInfo = analyzePost(postFile);
    
    // KPCB 포스트에 대해 자세한 로그
    if (postInfo.slug === 'kpcb-designin-tech-report-2016') {
      console.log(`🔍 ${postInfo.slug} 상세 분석:`);
      console.log(`   현재 이미지: ${postInfo.currentImages.length}개 - ${postInfo.currentImages}`);
      console.log(`   사용가능 이미지: ${postInfo.availableImages.length}개`);
      console.log(`   누락된 이미지: ${postInfo.missingImages.length}개`);
      console.log('');
    }
    
    if (postInfo.missingImages.length > 0) {
      console.log(`🔍 ${postInfo.slug}:`);
      console.log(`   현재 이미지: ${postInfo.currentImages.length}개`);
      console.log(`   사용가능 이미지: ${postInfo.availableImages.length}개`);
      console.log(`   누락된 이미지: ${postInfo.missingImages.length}개`);
      
      if (postInfo.availableImages.length > 5) { // 5개 이상인 포스트만 처리
        const updatedContent = addMissingImages(
          postInfo.content,
          postInfo.slug,
          postInfo.missingImages
        );
        
        // 백업 생성
        const backupPath = `${postInfo.filePath}.backup`;
        fs.copyFileSync(postInfo.filePath, backupPath);
        
        // 업데이트된 내용 저장
        fs.writeFileSync(postInfo.filePath, updatedContent);
        
        console.log(`   ✅ ${postInfo.missingImages.length}개 이미지 참조 추가완료`);
        console.log(`   💾 백업: ${backupPath}\n`);
        
        totalImagesAdded += postInfo.missingImages.length;
        totalProcessed++;
      } else {
        console.log(`   ⏭️  이미지 수가 적어 건너뜀\n`);
      }
    }
  }
  
  console.log(`\n🎉 완료!`);
  console.log(`📊 통계:`);
  console.log(`   - 처리된 포스트: ${totalProcessed}개`);
  console.log(`   - 추가된 이미지 참조: ${totalImagesAdded}개`);
  console.log(`   - 백업 파일들: content/posts/*.md.backup`);
}

// ES 모듈에서는 다른 방식 사용
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}