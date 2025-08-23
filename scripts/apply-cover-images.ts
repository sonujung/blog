import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content', 'posts');
const imagesDir = path.join(process.cwd(), 'public', 'images');

// 커버 이미지 파일 목록 가져오기
function getCoverImageFiles(): string[] {
  return fs.readdirSync(imagesDir)
    .filter(file => file.startsWith('cover-') && (file.endsWith('.jpg') || file.endsWith('.png')))
    .map(file => file.replace(/^cover-/, '').replace(/\.(jpg|png)$/, ''));
}

// 포스트 slug 추출
function getSlugFromFilename(filename: string): string {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

// 커버 이미지 적용
function applyCoverImages() {
  const coverImages = getCoverImageFiles();
  const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  let appliedCount = 0;
  let skippedCount = 0;
  
  console.log(`📁 발견된 포스트: ${postFiles.length}개`);
  console.log(`🖼️ 사용 가능한 커버 이미지: ${coverImages.length}개`);
  console.log('');

  for (const postFile of postFiles) {
    const filePath = path.join(postsDir, postFile);
    const slug = getSlugFromFilename(postFile);
    
    // 이미 커버 이미지가 있는지 확인
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    if (data.coverImage) {
      console.log(`⏭️  건너뜀: ${slug} (이미 커버 이미지 있음)`);
      skippedCount++;
      continue;
    }
    
    // 매칭되는 커버 이미지 찾기
    const matchingImage = coverImages.find(img => img === slug);
    
    if (matchingImage) {
      // 커버 이미지 추가
      data.coverImage = `/images/cover-${matchingImage}.jpg`;
      
      // 파일 업데이트
      const newContent = matter.stringify(content, data);
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      console.log(`✅ 적용: ${slug} → cover-${matchingImage}.jpg`);
      appliedCount++;
    } else {
      console.log(`❌ 매칭 없음: ${slug}`);
    }
  }
  
  console.log('');
  console.log('📊 결과 요약:');
  console.log(`✅ 커버 이미지 적용: ${appliedCount}개`);
  console.log(`⏭️  이미 설정됨: ${skippedCount}개`);
  console.log(`❌ 매칭 실패: ${postFiles.length - appliedCount - skippedCount}개`);
}

// 스크립트 실행
applyCoverImages();