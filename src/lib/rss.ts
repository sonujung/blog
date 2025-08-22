import { BlogPost } from '@/types/blog';

export function generateRSS(posts: BlogPost[]): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'sonujung.com';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '학구적이고 미니멀한 개발 블로그';

  const rssItems = posts
    .slice(0, 20) // 최신 20개 포스트만
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const publishDate = new Date(post.publishedAt).toUTCString();
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${publishDate}</pubDate>
      <author>noreply@sonujung.com (Sonu Jung)</author>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <description><![CDATA[${siteDescription}]]></description>
    <link>${siteUrl}</link>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <webMaster>noreply@sonujung.com (Sonu Jung)</webMaster>
    <managingEditor>noreply@sonujung.com (Sonu Jung)</managingEditor>
    <copyright>© 2024 Sonu Jung. All rights reserved.</copyright>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`.trim();
}