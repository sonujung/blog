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
    <article className="py-3 border-b border-gray-100 last:border-b-0">
      <Link href={`/blog/${post.slug}`} className="group flex items-baseline gap-4">
        <time className="text-gray-400 text-xs font-normal shrink-0 w-20">
          {formatDate(post.publishedAt).replace(/\./g, '').replace(/ /g, '.')}
        </time>
        <h2 className="text-sm text-gray-900 group-hover:text-gray-600 transition-colors leading-relaxed">
          {post.title}
        </h2>
      </Link>
    </article>
  );
}