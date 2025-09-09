const fs = require('fs-extra');
const path = require('path');

async function removeCoffeeMessage() {
  const postsDir = path.join(__dirname, '..', 'content', 'posts');
  const files = await fs.readdir(postsDir);
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  let totalRemoved = 0;
  
  for (const file of mdFiles) {
    const filePath = path.join(postsDir, file);
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    
    // 커피 후원 메시지 패턴들 제거
    const patterns = [
      /\n?---\n\n?잘 읽으셨나요\? 혹시 이 글이 도움이 되셨다면 아래 버튼을 눌러 커피 한 잔 어떠세요\? 여러분의 작은 후원이 창작자에게 큰 힘이 됩니다! 😁/g,
      /\n?잘 읽으셨나요\? 혹시 이 글이 도움이 되셨다면 아래 버튼을 눌러 커피 한 잔 어떠세요\?\s*여러분의 작은 후원이 창작자에게 큰 힘이 됩니다! 😁/g,
      /\n?잘 읽으셨나요\? 혹시 이 글이 도움이 되셨다면 아래 버튼을 눌러 커피 한 잔 어떠세요\?\s*\n?여러분의 작은 후원이 창작자에게 큰 힘이 됩니다! 😁/g
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // 파일 끝의 빈 줄 정리
    content = content.replace(/\n+$/, '');
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ ${file} - 커피 후원 멘트 제거`);
      totalRemoved++;
    }
  }
  
  console.log(`\n🎉 총 ${totalRemoved}개 파일에서 커피 후원 멘트가 제거되었습니다.`);
}

removeCoffeeMessage().catch(console.error);