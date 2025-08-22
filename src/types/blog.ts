export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  coverImage?: string;
  author: {
    name: string;
    email?: string;
  };
  status: 'published' | 'draft';
}

export interface BlogMeta {
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  coverImage?: string;
}

export interface SearchResult {
  post: BlogPost;
  score: number;
}