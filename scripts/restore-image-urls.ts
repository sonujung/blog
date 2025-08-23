import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content', 'posts');

// 실제 Hashnode 이미지 URL 매핑 (샘플)
const imageUrlMappings: Record<string, string> = {
  'a-brief-history-of-shopify-img-2.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1621019032903/z4NGf6OvQd.png',
  'a-brief-history-of-shopify-img-3.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1621265463932/rC7LOYlO-.png',
  'a-brief-history-of-shopify-img-4.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1621272440769/kWsFSvRdh.png',
  'a-brief-history-of-shopify-img-5.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1621273760225/vI064EFU3.png',
  'a-brief-history-of-shopify-img-6.png': 'https://cdn.hashnode.com/res/hashnode/image/upload/v1621276859525/nYUUDPboT.png',
  // 더 많은 매핑 추가 예정...
};

async function restoreImageUrls() {
  try {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 플레이스홀더 이미지를 실제 URL로 복원
      const placeholderRegex = /!\[([^\]]*)\]\(https:\/\/via\.placeholder\.com\/600x400\?text=([^)]+)\)/g;
      let match;
      
      while ((match = placeholderRegex.exec(content)) !== null) {
        const [fullMatch, altText, encodedImageName] = match;
        const imageName = decodeURIComponent(encodedImageName);
        
        if (imageUrlMappings[imageName]) {
          const realUrl = imageUrlMappings[imageName];
          const replacement = `![${altText}](${realUrl})`;
          content = content.replace(fullMatch, replacement);
          modified = true;
          console.log(`복원됨: ${imageName} -> ${realUrl}`);
        } else {
          console.log(`매핑 누락: ${imageName} in ${file}`);
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`파일 업데이트: ${file}`);
      }
    }
    
    console.log('이미지 URL 복원 완료');
  } catch (error) {
    console.error('이미지 URL 복원 중 오류:', error);
  }
}

restoreImageUrls();