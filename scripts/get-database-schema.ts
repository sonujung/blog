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

async function getDatabaseSchema() {
  try {
    console.log('🔍 Getting database schema...');
    
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID
    });
    
    console.log('\n📊 Database Properties:');
    console.log('------------------------');
    
    Object.keys(database.properties).forEach(propertyName => {
      const property = database.properties[propertyName];
      console.log(`- "${propertyName}": ${property.type}`);
      
      if (property.type === 'select' && 'select' in property && property.select.options) {
        console.log(`  Options: ${property.select.options.map(opt => opt.name).join(', ')}`);
      }
      
      if (property.type === 'multi_select' && 'multi_select' in property && property.multi_select.options) {
        console.log(`  Options: ${property.multi_select.options.map(opt => opt.name).join(', ')}`);
      }
    });
    
    console.log('\n📝 Raw properties object:');
    console.log(JSON.stringify(database.properties, null, 2));
    
  } catch (error) {
    console.error('❌ Error getting database schema:', error);
  }
}

getDatabaseSchema();