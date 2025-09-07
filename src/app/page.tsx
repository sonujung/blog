import { getAllPosts } from '@/lib/markdown';
import PostItem from '@/components/blog/PostItem';
import Link from 'next/link';

// 임시 더미 데이터 (Notion API 실패시 fallback)
const DUMMY_POSTS = [
  {
    id: "1",
    title: "From design thinking to design doing",
    slug: "from-design-thinking-to-design-doing",
    excerpt: "How to build successful, emotionally resonant products.",
    content: "# From design thinking to design doing\n\nThis is the content...",
    publishedAt: "2024-05-11",
    updatedAt: "2024-05-11",
    tags: ["design", "product"],
    author: { name: "Sonu Jung" },
    status: "published" as const
  },
  {
    id: "2", 
    title: "A practical guide to solving product debt",
    slug: "solving-product-debt",
    excerpt: "Most teams produce it, but few know how to fight it.",
    content: "# A practical guide to solving product debt\n\nProduct debt is...",
    publishedAt: "2024-05-08",
    updatedAt: "2024-05-08", 
    tags: ["product", "engineering"],
    author: { name: "Sonu Jung" },
    status: "published" as const
  },
  {
    id: "3",
    title: "The design of no-brainer plan choices", 
    slug: "design-no-brainer-plan-choices",
    excerpt: "How the decoy effect can ease users' decisions.",
    content: "# The design of no-brainer plan choices\n\nDecision making is...",
    publishedAt: "2024-05-04",
    updatedAt: "2024-05-04",
    tags: ["ux", "psychology"], 
    author: { name: "Sonu Jung" },
    status: "published" as const
  }
];

export default async function Home() {
  let posts;
  
  try {
    posts = await getAllPosts();
    // 마크다운 파일이 없으면 더미 데이터 사용
    if (posts.length === 0) {
      posts = DUMMY_POSTS;
    }
  } catch (error) {
    console.log("Using dummy data due to markdown loading error:", error);
    posts = DUMMY_POSTS;
  }

  // 최신순 정렬 (날짜 기준 내림차순)
  posts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="bg-white">
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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
