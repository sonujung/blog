import { getAllPosts } from '@/lib/notion';
import { getPostsByTag } from '@/lib/search';
import PostItem from '@/components/blog/PostItem';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface TagPageProps {
  params: { tag: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);

  return {
    title: `${decodedTag} 태그 | sonujung.com`,
    description: `${decodedTag} 태그가 포함된 모든 포스트를 확인해보세요.`,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const allTags = posts.flatMap(post => post.tags);
  const uniqueTags = [...new Set(allTags)];

  return uniqueTags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const decodedTag = decodeURIComponent(params.tag);
  const allPosts = await getAllPosts();
  const taggedPosts = getPostsByTag(allPosts, decodedTag);

  if (taggedPosts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-2xl mx-auto px-4 py-8 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-xl font-semibold text-black hover:text-gray-600 transition-colors">
          sonujung.com
        </Link>
        <nav className="flex gap-4">
          <Link href="/search" className="text-gray-600 hover:text-black text-sm transition-colors">
            Search
          </Link>
          <Link href="/subscribe" className="text-gray-600 hover:text-black text-sm transition-colors">
            Subscribe
          </Link>
        </nav>
      </header>

      {/* Tag Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            #{decodedTag}
          </h1>
          <p className="text-gray-600">
            {taggedPosts.length}개의 포스트
          </p>
        </header>

        {taggedPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </main>

      {/* Navigation */}
      <nav className="max-w-2xl mx-auto px-4 py-8 border-t border-gray-100">
        <Link 
          href="/" 
          className="text-gray-600 hover:text-black text-sm transition-colors"
        >
          ← Back to all posts
        </Link>
      </nav>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 border-t border-gray-100">
        <p className="text-gray-400 text-sm">
          © 2024 Sonu Jung. 학구적이고 미니멀한 개발 블로그.
        </p>
      </footer>
    </div>
  );
}