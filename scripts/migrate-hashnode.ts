#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GraphQLClient } from 'graphql-request';
import { Client } from '@notionhq/client';
import TurndownService from 'turndown';
import * as fs from 'fs-extra';
import * as path from 'path';

// Configuration
const HASHNODE_API_URL = 'https://gql.hashnode.com';
const HASHNODE_HOSTNAME = process.env.HASHNODE_HOSTNAME || 'your-blog.hashnode.dev';
const NOTION_API_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

if (!NOTION_API_TOKEN || !NOTION_DATABASE_ID) {
  console.error('Please set NOTION_TOKEN and NOTION_DATABASE_ID environment variables');
  process.exit(1);
}

const hashnodeClient = new GraphQLClient(HASHNODE_API_URL);
const notion = new Client({ auth: NOTION_API_TOKEN });
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

interface HashnodePost {
  id: string;
  title: string;
  slug: string;
  brief: string;
  content: {
    html: string;
    markdown: string;
  };
  publishedAt: string;
  updatedAt: string;
  url: string;
  coverImage?: {
    url: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  author: {
    name: string;
    username: string;
  };
}

const GET_POSTS_QUERY = `
  query GetPosts($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      title
      posts(first: $first, after: $after) {
        edges {
          node {
            id
            title
            slug
            brief
            content {
              html
              markdown
            }
            publishedAt
            updatedAt
            url
            coverImage {
              url
            }
            tags {
              name
              slug
            }
            author {
              name
              username
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

async function getAllHashnodePosts(): Promise<HashnodePost[]> {
  const posts: HashnodePost[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  console.log('📥 Fetching posts from Hashnode...');

  while (hasNextPage) {
    try {
      const variables = {
        host: HASHNODE_HOSTNAME,
        first: 20,
        ...(cursor ? { after: cursor } : {})
      };

      const response: any = await hashnodeClient.request(GET_POSTS_QUERY, variables);
      
      if (!response.publication) {
        console.error('❌ Publication not found. Check HASHNODE_HOSTNAME.');
        break;
      }

      const { edges, pageInfo } = response.publication.posts;
      const fetchedPosts = edges.map((edge: any) => edge.node);
      
      posts.push(...fetchedPosts);
      
      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;

      console.log(`   Found ${fetchedPosts.length} posts (total: ${posts.length})`);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      break;
    }
  }

  console.log(`✅ Total posts fetched: ${posts.length}`);
  return posts;
}

async function downloadImage(imageUrl: string, slug: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const filename = `${slug}-${path.basename(new URL(imageUrl).pathname)}`;
    const imagePath = path.join(process.cwd(), 'public', 'images', filename);

    await fs.ensureDir(path.dirname(imagePath));
    await fs.writeFile(imagePath, Buffer.from(buffer));

    return `/images/${filename}`;
  } catch (error) {
    console.error('❌ Error downloading image:', error);
    return null;
  }
}

async function processImages(content: string, slug: string): Promise<string> {
  const imageRegex = /!\[([^\]]*)\]\((https:\/\/[^)]+)\)/g;
  const images: Array<{ original: string; url: string; alt: string }> = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push({
      original: match[0],
      url: match[2],
      alt: match[1]
    });
  }

  let processedContent = content;

  for (const image of images) {
    console.log(`   📸 Downloading image: ${image.url}`);
    const localPath = await downloadImage(image.url, slug);
    
    if (localPath) {
      processedContent = processedContent.replace(
        image.original,
        `![${image.alt}](${localPath})`
      );
    }
  }

  return processedContent;
}

function createNotionBlocks(content: string) {
  const lines = content.split('\n');
  const blocks: any[] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
        }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: line.substring(3) } }]
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: line.substring(4) } }]
        }
      });
    } else if (line.startsWith('- ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
        }
      });
    } else if (line.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{ type: 'text', text: { content: line.substring(2) } }]
        }
      });
    } else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: line } }]
        }
      });
    }
  }

  return blocks;
}

async function migratePostToNotion(post: HashnodePost): Promise<boolean> {
  try {
    console.log(`📝 Migrating: ${post.title}`);

    // Convert HTML to Markdown if needed
    let content = post.content.markdown;
    if (!content && post.content.html) {
      content = turndown.turndown(post.content.html);
    }

    // Process images
    content = await processImages(content, post.slug);

    // Prepare Notion page properties
    const properties: any = {
      Title: {
        title: [{ text: { content: post.title } }]
      },
      Slug: {
        rich_text: [{ text: { content: post.slug } }]
      },
      Excerpt: {
        rich_text: [{ text: { content: post.brief || '' } }]
      },
      PublishedAt: {
        date: { start: post.publishedAt }
      },
      UpdatedAt: {
        date: { start: post.updatedAt }
      },
      Status: {
        select: { name: 'Published' }
      }
    };

    // Add tags if available
    if (post.tags && post.tags.length > 0) {
      properties.Tags = {
        multi_select: post.tags.map(tag => ({ name: tag.name }))
      };
    }

    // Add cover image if available
    if (post.coverImage?.url) {
      const localCoverPath = await downloadImage(post.coverImage.url, post.slug);
      if (localCoverPath) {
        properties.CoverImage = {
          rich_text: [{ text: { content: localCoverPath } }]
        };
      }
    }

    // Create Notion page
    const page = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties
    });

    // Add content as blocks
    if (content) {
      const blocks = createNotionBlocks(content);
      
      // Add blocks in batches of 100 (Notion limit)
      for (let i = 0; i < blocks.length; i += 100) {
        const batch = blocks.slice(i, i + 100);
        await notion.blocks.children.append({
          block_id: page.id,
          children: batch
        });
      }
    }

    console.log(`✅ Migrated successfully: ${post.title}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to migrate ${post.title}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Hashnode to Notion migration...\n');

  try {
    // Fetch all posts from Hashnode
    const posts = await getAllHashnodePosts();
    
    if (posts.length === 0) {
      console.log('ℹ️ No posts found to migrate.');
      return;
    }

    // Ensure images directory exists
    await fs.ensureDir(path.join(process.cwd(), 'public', 'images'));

    console.log(`\n📤 Starting migration of ${posts.length} posts to Notion...\n`);

    let successCount = 0;
    let failureCount = 0;

    // Migrate posts one by one (to avoid rate limits)
    for (const post of posts) {
      const success = await migratePostToNotion(post);
      
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${successCount} posts`);
    console.log(`❌ Failed to migrate: ${failureCount} posts`);

    // Create URL mapping file
    const urlMappings = posts.map(post => ({
      old_url: post.url,
      new_url: `https://sonujung.com/blog/${post.slug}`,
      slug: post.slug,
      published_at: post.publishedAt
    }));

    await fs.writeJSON(
      path.join(process.cwd(), 'migration-url-mappings.json'),
      { mappings: urlMappings },
      { spaces: 2 }
    );

    console.log('📄 URL mappings saved to migration-url-mappings.json');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

export { main as migrateHashnodeToNotion };