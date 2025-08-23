import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content', 'posts');

// 커버 이미지가 없는 포스트 찾기
function findPostsWithoutCover() {
  const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  const postsWithoutCover: string[] = [];
  
  for (const postFile of postFiles) {
    const filePath = path.join(postsDir, postFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    if (!data.coverImage) {
      const slug = postFile.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      postsWithoutCover.push(slug);
    }
  }
  
  return postsWithoutCover;
}

// 기본 커버 이미지 적용
function applyDefaultCovers() {
  const postsWithoutCover = findPostsWithoutCover();
  
  console.log(`📋 커버 이미지가 없는 포스트: ${postsWithoutCover.length}개`);
  console.log('');
  
  let appliedCount = 0;
  
  for (const slug of postsWithoutCover) {
    // 해당하는 파일 찾기
    const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    const matchingFile = postFiles.find(file => {
      const fileSlug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      return fileSlug === slug;
    });
    
    if (matchingFile) {
      const filePath = path.join(postsDir, matchingFile);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      // 기본 커버 이미지 설정 (존재하는 기본 이미지 사용)
      data.coverImage = '/images/cover-default.jpg';
      
      // 파일 업데이트
      const newContent = matter.stringify(content, data);
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      console.log(`✅ 기본 커버 적용: ${slug}`);
      appliedCount++;
    }
  }
  
  console.log('');
  console.log(`📊 총 ${appliedCount}개 포스트에 기본 커버 이미지 적용 완료`);
  console.log('🎯 이제 모든 포스트(100%)에 커버 이미지가 있습니다!');
}

// 스크립트 실행
applyDefaultCovers();