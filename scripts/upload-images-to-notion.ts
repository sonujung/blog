#!/usr/bin/env npx ts-node
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!NOTION_TOKEN) {
  console.error('NOTION_TOKEN 환경변수가 필요합니다.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// 이미지 파일을 노션에 업로드하는 함수
async function uploadImageToNotion(imagePath: string): Promise<string | null> {
  try {
    // 파일을 읽어서 base64로 인코딩
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // SVG 파일인 경우 data URL로 변환
    if (path.extname(imagePath).toLowerCase() === '.svg') {
      const svgContent = fs.readFileSync(imagePath, 'utf-8');
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    }
    
    // PNG/JPG 파일인 경우
    const ext = path.extname(imagePath).toLowerCase().replace('.', '');
    const mimeType = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mimeType};base64,${base64Image}`;
    
  } catch (error) {
    console.error(`이미지 업로드 실패 (${imagePath}):`, error);
    return null;
  }
}

// 테스트용 함수
async function testImageUpload() {
  const testImagePath = path.join(process.cwd(), 'public', 'images', 'critique-about-optical-adjustment-by-luke-jones-img-1.svg');
  
  if (fs.existsSync(testImagePath)) {
    console.log('🖼️  이미지 업로드 테스트 중...');
    const dataUrl = await uploadImageToNotion(testImagePath);
    
    if (dataUrl) {
      console.log('✅ Data URL 생성 성공');
      console.log(`📏 길이: ${dataUrl.length} 문자`);
      return dataUrl;
    } else {
      console.log('❌ Data URL 생성 실패');
      return null;
    }
  } else {
    console.log('❌ 테스트 이미지 파일을 찾을 수 없습니다:', testImagePath);
    return null;
  }
}

testImageUpload().then(result => {
  if (result) {
    console.log('🎉 이미지 데이터 URL 준비 완료!');
  } else {
    console.log('💡 대안: 이미지를 외부 CDN에 업로드하거나 GitHub에서 호스팅하는 방법을 고려해보세요.');
  }
});