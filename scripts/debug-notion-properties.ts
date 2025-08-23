import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: '.env.local' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function debugProperties() {
  try {
    // 데이터베이스 스키마 확인
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID!
    });
    
    console.log('\n🔍 데이터베이스 스키마:');
    console.log('속성들:', Object.keys(database.properties));
    
    for (const [key, prop] of Object.entries(database.properties)) {
      console.log(`- ${key}: ${(prop as any).type}`);
    }

    // 첫 번째 페이지의 실제 데이터 확인
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      page_size: 1
    });

    if (response.results.length > 0) {
      const firstPage = response.results[0] as any;
      console.log('\n📄 첫 번째 페이지 속성:');
      console.log('페이지 ID:', firstPage.id);
      
      for (const [key, prop] of Object.entries(firstPage.properties)) {
        console.log(`- ${key}:`, JSON.stringify(prop, null, 2));
      }
    }

  } catch (error) {
    console.error('오류:', error);
  }
}

debugProperties();