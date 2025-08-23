import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content', 'posts');

// 이미지 경로 매핑 (예제 - 실제로는 원본 URL을 찾아서 매핑해야 함)
const imageMapping: Record<string, string> = {
  // 예: '/images/growth-strategies-of-figma-img-3.png' -> 'https://cdn.hashnode.com/...'
};

async function fixImagePaths() {
  try {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // `/images/` 패턴의 이미지 참조를 찾기
      const imageRegex = /!\[([^\]]*)\]\(\/images\/([^)]+)\)/g;
      let match;
      
      while ((match = imageRegex.exec(content)) !== null) {
        const [fullMatch, altText, imageName] = match;
        console.log(`발견된 이미지: ${imageName} in ${file}`);
        
        // 일단 플레이스홀더로 변경 (나중에 실제 URL로 교체)
        const placeholder = `![${altText}](https://via.placeholder.com/600x400?text=${encodeURIComponent(imageName)})`;
        content = content.replace(fullMatch, placeholder);
        modified = true;
      }
      
      // [Image: filename] 패턴 제거
      const notionImageRegex = /\[Image:\s*([^\]]+)\]/g;
      if (content.match(notionImageRegex)) {
        content = content.replace(notionImageRegex, '');
        modified = true;
        console.log(`Notion 이미지 패턴 제거됨: ${file}`);
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`수정됨: ${file}`);
      }
    }
    
    console.log('이미지 경로 수정 완료');
  } catch (error) {
    console.error('이미지 경로 수정 중 오류:', error);
  }
}

fixImagePaths();