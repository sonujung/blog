#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Client } from '@notionhq/client';
import { readFile } from 'fs/promises';
import * as path from 'path';

// Configuration
const NOTION_API_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

if (!NOTION_API_TOKEN || !NOTION_DATABASE_ID) {
  console.error('Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_TOKEN });

interface HashnodeExportPost {
  title: string;
  slug: string;
  brief: string;
  publishedAt: string;
  dateAdded: string;
}

interface HashnodeExport {
  posts: HashnodeExportPost[];
}

async function migrateTestPosts() {
  try {
    console.log('🚀 Starting test migration...\n');

    // Read the export file
    const exportPath = path.join(process.cwd(), 'docs', 'hashnode_export.json');
    const exportData: HashnodeExport = JSON.parse(await readFile(exportPath, 'utf8'));
    
    // Take only first 2 posts for testing
    const testPosts = exportData.posts.slice(0, 2);
    
    console.log(`📊 Testing with ${testPosts.length} posts\n`);

    for (let i = 0; i < testPosts.length; i++) {
      const post = testPosts[i];
      console.log(`[${i + 1}/${testPosts.length}] Testing: ${post.title}`);
      console.log(`Original slug: ${post.slug}`);
      
      // Prepare Notion page properties
      const properties: any = {
        '문서 이름': {
          title: [{ text: { content: `TEST: ${post.title}` } }]
        },
        'Created At': {
          date: { start: post.publishedAt || post.dateAdded }
        },
        'slug': {
          rich_text: [{ text: { content: post.slug } }]
        },
        '상태': {
          status: { name: 'Published' }
        },
        '카테고리': {
          multi_select: [{ name: '일반' }]
        }
      };

      console.log('Properties being sent:');
      console.log(JSON.stringify(properties, null, 2));

      try {
        // Create Notion page
        const page = await notion.pages.create({
          parent: { database_id: NOTION_DATABASE_ID },
          properties
        });

        console.log(`✅ Created page: ${page.id}`);
        
        // Verify the slug was saved
        const createdPage = await notion.pages.retrieve({ page_id: page.id });
        if ('properties' in createdPage) {
          const slugProp = createdPage.properties['slug'] as any;
          const savedSlug = slugProp?.rich_text?.[0]?.text?.content || null;
          console.log(`Verified saved slug: ${savedSlug || 'NULL'}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create page for ${post.title}:`, error);
      }
      
      console.log('---\n');
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('🎉 Test migration completed!');
  } catch (error) {
    console.error('❌ Test migration failed:', error);
  }
}

migrateTestPosts();