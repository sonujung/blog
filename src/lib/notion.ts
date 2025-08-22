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
          property: "최종 업데이트 시간",
          direction: "descending"
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
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: "Slug",
            rich_text: {
              equals: slug
            }
          },
          {
            property: "Status", 
            select: {
              equals: "Published"
            }
          }
        ]
      }
    });

    if (response.results.length === 0) {
      return null;
    }

    return await getPostFromPage(response.results[0] as NotionPage);
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

    // Extract properties - 실제 한글 속성명 사용
    const title = getPropertyValue(properties['문서 이름']) || "";
    const slug = title ? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : "";
    const excerpt = title + "에 대한 글입니다."; // 임시 요약
    const publishedAt = getPropertyValue(properties['작성 일시']) || page.created_time;
    const updatedAt = getPropertyValue(properties['최종 업데이트 시간']) || page.last_edited_time;
    const tags = getPropertyValue(properties['카테고리']) || [];
    const status = getPropertyValue(properties['상태']) || "draft";

    // Get page content
    const content = await getPageContent(page.id);

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
        name: "Sonu Jung"
      },
      status: status === "Published" ? "published" : "draft"
    };
  } catch (error) {
    console.error("Error processing page:", error);
    return null;
  }
}

async function getPageContent(pageId: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId
    });

    let content = "";
    for (const block of response.results) {
      content += await blockToMarkdown(block as any);
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
    
    default:
      return '';
  }
}