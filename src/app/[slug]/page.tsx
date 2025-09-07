import { getPostBySlug, getAllPosts } from '@/lib/markdown';
import PostContent from '@/components/blog/PostContent';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com';
  const coverImageUrl = post.coverImage ? `${baseUrl}${post.coverImage}` : `${baseUrl}/images/cover-default.jpg`;

  return {
    title: `${post.title} | sonujung.com`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${baseUrl}/blog/${post.slug}`,
      images: [{
        url: coverImageUrl,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      siteName: 'Sonu Jung'
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [coverImageUrl],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-2xl mx-auto px-4 py-8 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-xl font-semibold text-black hover:text-gray-600 transition-colors">
          Sonu Jung
        </Link>
        <nav className="flex gap-4">
          <Link href="/subscribe" className="text-gray-600 hover:text-black text-sm transition-colors">
            Subscribe
          </Link>
        </nav>
      </header>

      {/* Post Content */}
      <PostContent post={post} />

      {/* Navigation */}
      <nav className="max-w-2xl mx-auto px-4 py-8 border-t border-gray-100">
        <Link 
          href="/" 
          className="text-gray-600 hover:text-black text-sm transition-colors"
        >
          ← Back to all posts
        </Link>
      </nav>

    </div>
  );
}