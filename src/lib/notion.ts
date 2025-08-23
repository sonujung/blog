import { Client } from "@notionhq/client";
import { BlogPost } from "@/types/blog";
import { NotionPage } from "@/types/notion";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: 'Created At',
          direction: 'descending'
        }
      ]
    });

    const posts = await Promise.all(
      response.results.map(async (page) => {
        return await getPostFromPage(page as NotionPage);
      })
    );

    return posts.filter((post): post is BlogPost => post !== null);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // URL 디코딩
    const decodedSlug = decodeURIComponent(slug);
    
    // UUID 패턴 확인 (Notion page ID 형식)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidPattern.test(decodedSlug)) {
      // page ID로 직접 페이지 가져오기
      const page = await notion.pages.retrieve({ page_id: decodedSlug });
      return await getPostFromPage(page as NotionPage);
    }
    
    // 일반 slug인 경우 모든 포스트에서 찾기
    const allPosts = await getAllPosts();
    return allPosts.find(post => post.slug === decodedSlug) || null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

async function getPostFromPage(page: NotionPage): Promise<BlogPost | null> {
  try {
    if (!('properties' in page)) {
      return null;
    }

    const properties = page.properties;

    // Extract properties - 실제 노션 데이터베이스 속성명 사용
    const title = getPropertyValue(properties['문서 이름']) || "";
    // 원본 slug가 있으면 사용하고, 없으면 page ID 사용
    const originalSlug = getPropertyValue(properties['slug']) || null;
    const slug = originalSlug || page.id.slice(0, 8);
    const excerpt = title + "에 대한 글입니다."; // 임시 요약
    const publishedAt = getPropertyValue(properties['Created At']) || page.created_time;
    const updatedAt = page.last_edited_time; // 노션 기본 속성 사용
    const tags = getPropertyValue(properties['카테고리']) || [];
    const status = getPropertyValue(properties['상태']) || "draft";
    const author = getPropertyValue(properties['Author']) || "Sonu Jung";

    // 노션 블록에서 콘텐츠 가져오기 (content 속성 없음)
    const content = await getPageContent(page.id, slug);

    return {
      id: page.id,
      title: title || "제목 없음",
      slug: slug || page.id,
      excerpt,
      content,
      publishedAt,
      updatedAt,
      tags,
      author: {
        name: author
      },
      status: status === "Published" ? "published" : "draft"
    };
  } catch (error) {
    console.error("Error processing page:", error);
    return null;
  }
}

async function getPageContent(pageId: string, slug?: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId
    });

    let content = "";
    let imageCounter = 1;
    
    for (const block of response.results) {
      const blockContent = await blockToMarkdown(block as any);
      
      // Replace image placeholders with actual local paths
      if (slug && blockContent.includes('[Image: ')) {
        const imagePattern = /\[Image: [^\]]+\]/g;
        const replacedContent = blockContent.replace(imagePattern, () => {
          const imagePath = `/images/${slug}-img-${imageCounter}.png`;
          imageCounter++;
          return `![Image](${imagePath})`;
        });
        content += replacedContent;
      } else {
        content += blockContent;
      }
    }

    return content;
  } catch (error) {
    console.error("Error fetching page content:", error);
    return "";
  }
}

function getPropertyValue(property: any): any {
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return property.title?.[0]?.text?.content || "";
    case 'rich_text':
      return property.rich_text?.[0]?.text?.content || "";
    case 'select':
      return property.select?.name || "";
    case 'status':
      return property.status?.name || "";
    case 'multi_select':
      return property.multi_select?.map((tag: any) => tag.name) || [];
    case 'date':
      return property.date?.start || "";
    case 'created_time':
      return property.created_time || "";
    case 'last_edited_time':
      return property.last_edited_time || "";
    default:
      return null;
  }
}

async function blockToMarkdown(block: any): Promise<string> {
  const { type } = block;
  
  switch (type) {
    case 'paragraph':
      const text = block.paragraph?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      
      // Handle image placeholders by converting them to actual local paths
      if (text.includes('[Image: ')) {
        // Try to find matching local image based on context
        // For now, keep the placeholder but make it more visible for debugging
        return `${text}\n\n`;
      }
      
      return `${text}\n\n`;
    
    case 'heading_1':
      const h1Text = block.heading_1?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      return `# ${h1Text}\n\n`;
    
    case 'heading_2':
      const h2Text = block.heading_2?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      return `## ${h2Text}\n\n`;
    
    case 'heading_3':
      const h3Text = block.heading_3?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      return `### ${h3Text}\n\n`;
    
    case 'bulleted_list_item':
      const bulletText = block.bulleted_list_item?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      return `- ${bulletText}\n`;
    
    case 'numbered_list_item':
      const numberedText = block.numbered_list_item?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      return `1. ${numberedText}\n`;
    
    case 'code':
      const codeText = block.code?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      const language = block.code?.language || '';
      return `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
    
    case 'quote':
      const quoteText = block.quote?.rich_text?.map((t: any) => t.text?.content).join('') || '';
      return `> ${quoteText}\n\n`;

    case 'image':
      // Handle Notion image blocks
      const imageUrl = block.image?.external?.url || block.image?.file?.url || '';
      if (imageUrl) {
        return `![Image](${imageUrl})\n\n`;
      }
      return '';
    
    default:
      console.log(`Unknown block type: ${type}`, block);
      return '';
  }
}