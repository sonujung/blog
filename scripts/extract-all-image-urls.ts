import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content', 'posts');

// 포스트 파일명과 원본 블로그 URL 매핑
const postUrlMappings: Record<string, string> = {
  '2021-04-15-today-i-learned-2021-04.md': 'https://sonujung.com/today-i-learned-2021-04',
  '2021-05-05-growth-strategies-of-figma.md': 'https://sonujung.com/growth-strategies-of-figma',
  '2021-05-27-a-brief-history-of-shopify.md': 'https://sonujung.com/a-brief-history-of-shopify',
};

async function extractImageUrls() {
  try {
    console.log('🔍 플레이스홀더 이미지가 있는 포스트를 분석 중...');
    
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    const imageMapping: Record<string, string> = {};
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 플레이스홀더 이미지가 있는지 확인
      const placeholderRegex = /https:\/\/via\.placeholder\.com\/600x400\?text=([^)]+)/g;
      let match;
      const foundImages: string[] = [];
      
      while ((match = placeholderRegex.exec(content)) !== null) {
        const imageName = decodeURIComponent(match[1]);
        foundImages.push(imageName);
      }
      
      if (foundImages.length > 0) {
        console.log(`📄 ${file}: ${foundImages.length}개 이미지 발견`);
        
        // 원본 블로그 URL이 있으면 이미지 추출 시도
        if (postUrlMappings[file]) {
          console.log(`🌐 ${postUrlMappings[file]}에서 이미지 URL 추출 시도...`);
          
          try {
            const response = await fetch(postUrlMappings[file]);
            const html = await response.text();
            
            // HTML에서 Hashnode CDN 이미지 URL 추출
            const cdnImageRegex = /https:\/\/cdn\.hashnode\.com\/res\/hashnode\/image\/upload\/[^"'\s>]+/g;
            const cdnImages = html.match(cdnImageRegex) || [];
            
            console.log(`📸 발견된 CDN 이미지: ${cdnImages.length}개`);
            
            // 순서대로 매핑 (완벽하지 않지만 대부분 순서가 맞음)
            foundImages.forEach((imageName, index) => {
              if (cdnImages[index]) {
                imageMapping[imageName] = cdnImages[index];
                console.log(`✅ ${imageName} -> ${cdnImages[index]}`);
              } else {
                console.log(`❌ ${imageName}: 매핑할 CDN 이미지 없음`);
              }
            });
            
          } catch (error) {
            console.error(`❌ ${file} 이미지 추출 실패:`, error);
          }
        } else {
          console.log(`⚠️  ${file}: 원본 URL 매핑 없음`);
        }
      }
    }
    
    // 결과 출력
    console.log('\n📊 이미지 매핑 결과:');
    console.log(`총 ${Object.keys(imageMapping).length}개 이미지 매핑 완료`);
    
    // TypeScript 파일로 출력
    const mappingCode = `export const imageUrlMappings: Record<string, string> = ${JSON.stringify(imageMapping, null, 2)};`;
    fs.writeFileSync(path.join(process.cwd(), 'scripts', 'image-mappings.ts'), mappingCode);
    
    console.log('✅ 이미지 매핑이 scripts/image-mappings.ts에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 이미지 URL 추출 중 오류:', error);
  }
}

extractImageUrls();