const fs = require('fs-extra');
const path = require('path');

async function copyImages() {
  const sourceDir = path.join(__dirname, '..', 'content-images', 'posts-images');
  const targetDir = path.join(__dirname, '..', 'public', 'images');
  
  try {
    // public/images 디렉토리 준비
    await fs.ensureDir(targetDir);
    
    // content-images/posts-images에서 public/images로 복사
    if (await fs.pathExists(sourceDir)) {
      await fs.copy(sourceDir, targetDir, { overwrite: false, errorOnExist: false });
      console.log('✅ 이미지 파일들이 성공적으로 준비되었습니다.');
      console.log(`   📂 ${sourceDir} → ${targetDir}`);
    } else {
      console.log('⚠️  소스 이미지 디렉토리가 존재하지 않습니다:', sourceDir);
    }
  } catch (error) {
    console.error('❌ 이미지 준비 중 오류 발생:', error);
    process.exit(1);
  }
}

copyImages();