import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content', 'posts');

// 추출된 이미지 매핑
const imageUrlMappings: Record<string, string> = {
  "today-i-learned-2021-04-img-3.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1611583379596/ousKwGbo2.jpeg?auto=compress,format&format=webp&fm=png",
  "growth-strategies-of-figma-img-3.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1611583379596/ousKwGbo2.jpeg?auto=compress,format&format=webp&fm=png", 
  "growth-strategies-of-figma-img-4.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620140484134/i_pLBlk-p.png",
  "growth-strategies-of-figma-img-5.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1722627146487/TlCQUwEql.jpeg?w=200&h=200&fit=crop&crop=faces&auto=compress,format&format=webp",
  "growth-strategies-of-figma-img-6.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620140484134/i_pLBlk-p.png?w=400&h=210&fit=crop&crop=entropy&auto=compress,format&format=webp&fm=blurhash",
  "growth-strategies-of-figma-img-7.gif": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620140484134/i_pLBlk-p.png?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp",
  "growth-strategies-of-figma-img-8.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620032122947/odkzpsAq8.png?auto=compress,format&format=webp",
  "growth-strategies-of-figma-img-9.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620063568297/_KGJeER2q.png?auto=compress,format&format=webp",
  "growth-strategies-of-figma-img-11.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620065922659/GS-Zmibxp.png?auto=compress,format&format=webp",
  "growth-strategies-of-figma-img-12.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1620065959592/soaGyQREM.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-7.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1611583379596/ousKwGbo2.jpeg?auto=compress,format&format=webp&fm=png",
  "a-brief-history-of-shopify-img-8.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621019032903/z4NGf6OvQd.png?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-9.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621019032903/z4NGf6OvQd.png",
  "a-brief-history-of-shopify-img-10.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621019032903/z4NGf6OvQd.png?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-11.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621019032903/z4NGf6OvQd.png?w=400&h=210&fit=crop&crop=entropy&auto=compress,format&format=webp&fm=blurhash",
  "a-brief-history-of-shopify-img-12.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621019032903/z4NGf6OvQd.png?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-13.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1722627146487/TlCQUwEql.jpeg?w=200&h=200&fit=crop&crop=faces&auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-16.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621265463932/rC7LOYlO-.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-17.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621272440769/kWsFSvRdh.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-18.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621273760225/vI064EFU3.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-19.jpeg": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621276859525/nYUUDPboT.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-21.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621335212968/yPExEO4RD.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-22.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621344546328/VhZEektGN.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-23.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621357280632/S9qqLyVQ1.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-24.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621420608147/FPvuUYrVJ.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-25.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621424758815/GSbZv7sCL.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-26.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621690202403/Xsj2Ausay.png?auto=compress,format&format=webp",
  "a-brief-history-of-shopify-img-27.png": "https://cdn.hashnode.com/res/hashnode/image/upload/v1621427659239/bf975Kfyt.png?auto=compress,format&format=webp"
};

async function applyAllImageMappings() {
  try {
    console.log('🔄 모든 이미지 매핑을 적용 중...');
    console.log(`📊 총 ${Object.keys(imageUrlMappings).length}개 이미지 매핑 보유`);
    
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
          const realUrl = imageUrlMappings[imageName];
          const replacement = `![${altText}](${realUrl})`;
          content = content.replace(fullMatch, replacement);
          fileReplacements++;
          console.log(`✅ ${file}: ${imageName} -> 실제 CDN URL로 교체`);
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
    
    console.log(`\n🎉 완료! 총 ${totalReplacements}개 이미지가 실제 Hashnode CDN URL로 교체되었습니다.`);
    
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
      console.log('🎊 완벽! 모든 플레이스홀더가 실제 이미지로 교체되었습니다!');
    } else {
      console.log(`⚠️  ${remainingPlaceholders}개 플레이스홀더가 아직 남아있습니다.`);
    }
    
  } catch (error) {
    console.error('❌ 이미지 매핑 적용 중 오류:', error);
  }
}

applyAllImageMappings();