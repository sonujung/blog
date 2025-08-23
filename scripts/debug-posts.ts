#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Client } from '@notionhq/client';

const NOTION_API_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

if (!NOTION_API_TOKEN || !NOTION_DATABASE_ID) {
  console.error('Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_TOKEN });

async function debugPosts() {
  try {
    console.log('🔍 Getting first few posts...');
    
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 5
    });
    
    console.log(`📊 Found ${response.results.length} posts`);
    
    for (const page of response.results) {
      if ('properties' in page) {
        const properties = page.properties;
        
        // Type safe property access
        const titleProp = properties['문서 이름'] as any;
        const title = titleProp?.title?.[0]?.text?.content || 'No title';
        
        const slugProp = properties['slug'] as any;
        const slug = slugProp?.rich_text?.[0]?.text?.content || null;
        
        const dateProp = properties['Created At'] as any;
        const createdAt = dateProp?.date?.start || 'No date';
        
        console.log('\n-----------------');
        console.log(`Title: ${title}`);
        console.log(`Slug: ${slug || 'NULL'}`);
        console.log(`Created At: ${createdAt}`);
        console.log(`Page ID: ${page.id}`);
        console.log(`Page ID (short): ${page.id.slice(0, 8)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugPosts();