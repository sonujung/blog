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
  content: string;
  contentMarkdown: string;
  publishedAt: string;
  dateAdded: string;
}

interface HashnodeExport {
  posts: HashnodeExportPost[];
}

async function updateContent() {
  try {
    console.log('🚀 Starting content update...\n');

    // Read the export file to get original content
    const exportPath = path.join(process.cwd(), 'docs', 'hashnode_export.json');
    const exportData: HashnodeExport = JSON.parse(await readFile(exportPath, 'utf8'));
    
    // Get all existing pages from Notion
    console.log('📥 Fetching all pages from Notion...');
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID
    });

    console.log(`📊 Found ${response.results.length} pages in Notion\n`);

    // Find pages that need content update
    const pagesToUpdate = [];
    
    for (const page of response.results) {
      if ('properties' in page) {
        const titleProp = page.properties['문서 이름'] as any;
        const title = titleProp?.title?.[0]?.text?.content || '';
        
        const contentProp = page.properties['content'] as any;
        const existingContent = contentProp?.rich_text?.[0]?.text?.content || null;
        
        // Skip test posts and posts that already have content
        if (title.startsWith('TEST:')) {
          console.log(`⏭️  Skipping test post: ${title}`);
          continue;
        }
        
        // Find matching post in export by title
        const matchingPost = exportData.posts.find(post => 
          post.title.trim() === title.trim()
        );
        
        if (matchingPost) {
          const originalContent = matchingPost.contentMarkdown || matchingPost.content || '';
          
          if (!existingContent && originalContent) {
            pagesToUpdate.push({
              pageId: page.id,
              title,
              originalContent: originalContent.substring(0, 2000) // Notion rich_text limit
            });
          } else if (existingContent) {
            console.log(`⏭️  Already has content: ${title}`);
          } else {
            console.log(`⚠️  No content in export for: ${title}`);
          }
        } else {
          console.log(`⚠️  No matching export found for: ${title}`);
        }
      }
    }

    console.log(`\n🎯 Found ${pagesToUpdate.length} pages to update with content\n`);

    // Update pages with their original content
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < pagesToUpdate.length; i++) {
      const { pageId, title, originalContent } = pagesToUpdate[i];
      
      console.log(`[${i + 1}/${pagesToUpdate.length}] Updating: ${title}`);
      console.log(`Content length: ${originalContent.length} chars`);
      
      try {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            'content': {
              rich_text: [{ text: { content: originalContent } }]
            }
          }
        });
        
        console.log(`✅ Updated successfully`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update: ${error}`);
        failureCount++;
      }
      
      console.log('---\n');
      
      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🎉 Content update completed!');
    console.log(`✅ Successfully updated: ${successCount} pages`);
    console.log(`❌ Failed to update: ${failureCount} pages`);

  } catch (error) {
    console.error('❌ Content update failed:', error);
  }
}

updateContent();