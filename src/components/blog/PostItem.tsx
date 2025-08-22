import Link from 'next/link';
import { BlogPost } from '@/types/blog';

interface PostItemProps {
  post: BlogPost;
}

export default function PostItem({ post }: PostItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <article className="border-b border-gray-100 pb-16 mb-16 last:border-b-0">
      <time className="text-gray-500 text-sm font-normal">
        {formatDate(post.publishedAt)}
      </time>
      
      <Link href={`/blog/${post.slug}`} className="group">
        <h2 className="text-2xl font-semibold text-gray-900 mt-2 mb-3 leading-tight group-hover:text-gray-600 transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-600 text-base leading-relaxed">
          {post.excerpt}
        </p>
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mt-4">
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              href={`/tag/${tag}`}
              className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-2 py-1 rounded transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}