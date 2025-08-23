import fs from 'fs';
import path from 'path';

// 이미지 매핑을 파일에서 직접 읽기
const mappingFilePath = path.join(process.cwd(), 'scripts', 'image-mappings.ts');
const mappingFileContent = fs.readFileSync(mappingFilePath, 'utf8');
const mappingMatch = mappingFileContent.match(/= ({[\s\S]*});/);
let imageUrlMappings: Record<string, string> = {};

if (mappingMatch) {
  try {
    // JSON 파싱을 위해 문자열 정리
    const jsonString = mappingMatch[1]
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/'/g, '"');
    imageUrlMappings = JSON.parse(jsonString);
  } catch (error) {
    console.error('매핑 파일 파싱 오류:', error);
  }
}

const postsDir = path.join(process.cwd(), 'content', 'posts');

// HTML 엔티티 디코딩 함수
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function applyAllImageMappings() {
  try {
    console.log('🔄 모든 이미지 매핑을 적용 중...');
    
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    let totalReplacements = 0;
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileReplacements = 0;
      
      // 플레이스홀더 이미지를 실제 URL로 교체
      const placeholderRegex = /!\[([^\]]*)\]\(https:\/\/via\.placeholder\.com\/600x400\?text=([^)]+)\)/g;
      let match;
      
      while ((match = placeholderRegex.exec(content)) !== null) {
        const [fullMatch, altText, encodedImageName] = match;
        const imageName = decodeURIComponent(encodedImageName);
        
        if (imageUrlMappings[imageName]) {
          const cleanUrl = decodeHtmlEntities(imageUrlMappings[imageName]);
          const replacement = `![${altText}](${cleanUrl})`;
          content = content.replace(fullMatch, replacement);
          fileReplacements++;
          console.log(`✅ ${file}: ${imageName} -> 실제 이미지 URL로 교체`);
        } else {
          console.log(`⚠️  ${file}: ${imageName} - 매핑 없음`);
        }
      }
      
      if (fileReplacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalReplacements += fileReplacements;
        console.log(`📝 ${file}: ${fileReplacements}개 이미지 교체 완료`);
      }
    }
    
    console.log(`\n🎉 완료! 총 ${totalReplacements}개 이미지가 실제 URL로 교체되었습니다.`);
    
    // 남은 플레이스홀더 확인
    console.log('\n🔍 남은 플레이스홀더 확인 중...');
    let remainingPlaceholders = 0;
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const placeholderMatches = content.match(/https:\/\/via\.placeholder\.com/g);
      if (placeholderMatches) {
        remainingPlaceholders += placeholderMatches.length;
        console.log(`⚠️  ${file}: ${placeholderMatches.length}개 플레이스홀더 남음`);
      }
    }
    
    if (remainingPlaceholders === 0) {
      console.log('✅ 모든 플레이스홀더가 실제 이미지로 교체되었습니다!');
    } else {
      console.log(`⚠️  ${remainingPlaceholders}개 플레이스홀더가 아직 남아있습니다.`);
    }
    
  } catch (error) {
    console.error('❌ 이미지 매핑 적용 중 오류:', error);
  }
}

applyAllImageMappings();