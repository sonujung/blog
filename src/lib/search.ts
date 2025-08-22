import Fuse from 'fuse.js';
import { BlogPost, SearchResult } from '@/types/blog';

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'excerpt', weight: 0.3 },
    { name: 'content', weight: 0.2 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2
};

export function searchPosts(posts: BlogPost[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const fuse = new Fuse(posts, fuseOptions);
  const results = fuse.search(query);

  return results.map(result => ({
    post: result.item,
    score: result.score || 0
  }));
}

export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(posts: BlogPost[]): { tag: string; count: number }[] {
  const tagCounts: Record<string, number> = {};

  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}