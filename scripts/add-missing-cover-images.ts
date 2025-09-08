#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

interface PostCover {
  slug: string;
  filePath: string;
  hasCover: boolean;
  firstImage?: string;
  suggestedCover?: string;
}

function getPostSlug(filePath: string): string {
  const basename = path.basename(filePath, '.md');
  return basename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function hasCoverImage(content: string): boolean {
  return content.includes('coverImage:');
}

function getFirstImage(content: string, slug: string): string | undefined {
  // 포스트 내에서 첫 번째 이미지 찾기
  const imageMatch = content.match(/!\[.*?\]\(\/images\/([^)]+)\)/);
  if (imageMatch && imageMatch[1]) {
    return imageMatch[1];
  }
  
  // 해당 slug의 첫 번째 이미지 파일 찾기
  const patterns = [
    `public/images/${slug}-img-1.png`,
    `public/images/${slug}-img-1.jpg`,
    `public/images/${slug}-img-1.jpeg`,
    `public/images/${slug}-img-1.gif`,
    `public/images/${slug}-img-1.svg`
  ];
  
  for (const pattern of patterns) {
    const files = globSync(pattern);
    if (files.length > 0) {
      return path.basename(files[0]);
    }
  }
  
  return undefined;
}

function addCoverImage(content: string, coverImagePath: string): string {
  // frontmatter에서 excerpt 다음에 coverImage 추가
  if (content.includes('excerpt:')) {
    return content.replace(
      /^excerpt: ".*"$/m,
      `$&\ncoverImage: "/images/${coverImagePath}"`
    );
  } else {
    // excerpt가 없으면 tags 다음에 둘 다 추가
    return content.replace(
      /^tags: \[.*\]$/m,
      `$&\nexcerpt: ""\ncoverImage: "/images/${coverImagePath}"`
    );
  }
}

function main() {
  const postFiles = globSync('content/posts/*.md');
  const analyses: PostCover[] = [];
  
  console.log('🖼️ 커버이미지 누락 포스트 분석 중...\n');
  
  // 분석
  for (const postFile of postFiles) {
    const content = fs.readFileSync(postFile, 'utf-8');
    const slug = getPostSlug(postFile);
    const hasCover = hasCoverImage(content);
    const firstImage = getFirstImage(content, slug);
    
    const analysis: PostCover = {
      slug,
      filePath: postFile,
      hasCover,
      firstImage,
      suggestedCover: firstImage
    };
    
    analyses.push(analysis);
  }
  
  // 커버이미지가 없지만 이미지가 있는 포스트들 찾기
  const needsCover = analyses.filter(a => !a.hasCover && a.suggestedCover);
  
  console.log(`📊 분석 결과:`);
  console.log(`   총 포스트: ${analyses.length}개`);
  console.log(`   커버이미지 있는 포스트: ${analyses.filter(a => a.hasCover).length}개`);
  console.log(`   커버이미지 필요한 포스트: ${needsCover.length}개\n`);
  
  if (needsCover.length === 0) {
    console.log('✅ 모든 포스트에 커버이미지가 있습니다!');
    return;
  }
  
  console.log('🔧 커버이미지 추가 중...\n');
  
  let processed = 0;
  
  for (const post of needsCover) {
    if (post.suggestedCover) {
      console.log(`📝 ${post.slug}`);
      console.log(`   추가할 커버: ${post.suggestedCover}`);
      
      const content = fs.readFileSync(post.filePath, 'utf-8');
      const updatedContent = addCoverImage(content, post.suggestedCover);
      
      // 백업 생성
      const backupPath = `${post.filePath}.cover-backup`;
      fs.copyFileSync(post.filePath, backupPath);
      
      // 업데이트된 내용 저장
      fs.writeFileSync(post.filePath, updatedContent);
      
      console.log(`   ✅ 커버이미지 추가 완료`);
      console.log(`   💾 백업: ${backupPath}\n`);
      
      processed++;
    }
  }
  
  console.log(`🎉 완료!`);
  console.log(`📊 통계:`);
  console.log(`   - 처리된 포스트: ${processed}개`);
  console.log(`   - 백업 파일들: content/posts/*.md.cover-backup`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}