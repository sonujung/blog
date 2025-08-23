import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/types/blog';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // content/posts 디렉토리가 없으면 빈 배열 반환
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const markdownFiles = fileNames.filter(name => name.endsWith('.md'));

    const posts = markdownFiles.map((fileName) => {
      const fileSlug = fileName.replace(/\.md$/, '');
      // 날짜 부분 제거 (YYYY-MM-DD- 패턴)
      const slug = fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // gray-matter로 frontmatter와 내용 파싱
      const { data, content } = matter(fileContents);

      return {
        id: slug,
        slug,
        title: data.title || fileName.replace(/\.md$/, ''),
        excerpt: data.excerpt || data.description || '',
        content,
        publishedAt: data.publishedAt || data.date || new Date().toISOString().split('T')[0],
        updatedAt: data.updatedAt || data.publishedAt || data.date || new Date().toISOString().split('T')[0],
        tags: data.tags || [],
        coverImage: data.coverImage,
        author: {
          name: data.author || 'Sonu Jung'
        },
        status: 'published' as const
      };
    });

    // 날짜순으로 정렬 (최신순)
    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.error('Error reading markdown files:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await getAllPosts();
    return posts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.error('Error getting post by slug:', error);
    return null;
  }
}

export async function getPageContent(postId: string): Promise<string> {
  // 마크다운 방식에서는 getAllPosts에서 이미 content를 로드함
  const post = await getPostBySlug(postId);
  return post?.content || '';
}