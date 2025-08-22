import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/notion';
import { getAllTags } from '@/lib/search';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com';
  
  const posts = await getAllPosts();
  const tags = getAllTags(posts);

  // Static pages
  const staticPages = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Blog posts
  const postPages = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Tag pages
  const tagPages = tags.map(({ tag }) => ({
    url: `${siteUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...tagPages];
}