#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'content', 'posts', 'images');
const targetDir = path.join(__dirname, '..', 'public', 'images');

async function copyImages() {
  try {
    // 타겟 디렉토리 생성 (존재하지 않을 경우)
    await fs.ensureDir(targetDir);
    
    // 기존 파일들 제거
    await fs.emptyDir(targetDir);
    
    // 소스 디렉토리가 존재하는지 확인
    if (await fs.pathExists(sourceDir)) {
      // 모든 이미지 파일을 복사
      await fs.copy(sourceDir, targetDir);
      console.log('✅ 이미지 파일들이 성공적으로 복사되었습니다.');
      console.log(`   📂 ${sourceDir} → ${targetDir}`);
    } else {
      console.log('⚠️  소스 이미지 디렉토리가 존재하지 않습니다:', sourceDir);
    }
  } catch (error) {
    console.error('❌ 이미지 복사 중 오류 발생:', error);
    process.exit(1);
  }
}

copyImages();