import { BlogPost } from '@/types/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface PostContentProps {
  post: BlogPost;
}

export default function PostContent({ post }: PostContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      {/* Post Meta */}
      <header className="mb-12">
        <time className="text-gray-500 text-sm font-normal">
          {formatDate(post.publishedAt)}
        </time>
        
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mt-2 mb-4 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-gray-600 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mt-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Post Content */}
      <div className="prose prose-lg prose-gray max-w-none
                      prose-headings:font-semibold prose-headings:text-gray-900
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-gray-900 prose-a:underline prose-a:decoration-gray-300 hover:prose-a:decoration-gray-600
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg prose-pre:p-4
                      prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-600 prose-blockquote:pl-4
                      prose-ul:text-gray-700 prose-ol:text-gray-700
                      prose-li:text-gray-700 prose-li:mb-1
                      prose-img:rounded-lg prose-img:mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-semibold text-gray-900 mt-8 mb-4 leading-tight">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 leading-tight">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 leading-tight">{children}</h3>,
            p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
            a: ({ href, children }) => (
              <a href={href} className="text-gray-900 underline decoration-gray-300 hover:decoration-gray-600 transition-colors">
                {children}
              </a>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return <code className="text-gray-900 bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>;
              }
              return <code className={className}>{children}</code>;
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-6">
                {children}
              </blockquote>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}