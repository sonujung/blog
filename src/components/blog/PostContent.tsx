import { BlogPost } from '@/types/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import YouTubeEmbed, { getYouTubeVideoId } from './YouTubeEmbed';

// 컨텐츠에서 YouTube 링크 처리
function processVideoLinks(content: string): string {
  // YouTube와 Vimeo 링크를 iframe으로 변환
  let processedContent = content;
  
  // YouTube 링크 처리
  processedContent = processedContent.replace(/%\[(https?:\/\/(www\.)?(youtube\.com|youtu\.be)[^\]]+)\]/g, (match, url) => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `
<div class="video-embed my-8 flex justify-center">
  <div class="w-full max-w-3xl">
    <div class="relative w-full h-0" style="padding-bottom: 56.25%;">
      <iframe
        class="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
        src="https://www.youtube.com/embed/${videoId}"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  </div>
</div>
`;
    }
    return match;
  });
  
  // Vimeo 링크 처리
  processedContent = processedContent.replace(/%\[(https?:\/\/(www\.)?vimeo\.com\/[^\]]+)\]/g, (match, url) => {
    const videoId = getVimeoVideoId(url);
    if (videoId) {
      return `
<div class="video-embed my-8 flex justify-center">
  <div class="w-full max-w-3xl">
    <div class="relative w-full h-0" style="padding-bottom: 56.25%;">
      <iframe
        class="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
        src="https://player.vimeo.com/video/${videoId}"
        title="Vimeo video player"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  </div>
</div>
`;
    }
    return match;
  });
  
  return processedContent;
}

// Vimeo URL에서 비디오 ID 추출
function getVimeoVideoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

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

  // YouTube/Vimeo 링크 전처리
  const processedContent = processVideoLinks(post.content);

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

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-12 -mx-4">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={600}
            className="w-full h-auto rounded-lg"
            style={{ aspectRatio: '2/1', objectFit: 'cover' }}
            priority={true}
          />
        </div>
      )}

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
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
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
            hr: () => (
              <hr className="border-0 border-t border-gray-200 my-8" />
            ),
            img: ({ src, alt }) => {
              if (!src) return null;
              
              // Handle both local and external images
              const srcString = typeof src === 'string' ? src : '';
              const isExternal = srcString.startsWith('http');
              
              if (isExternal) {
                // For external images, use standard img tag
                return (
                  <img 
                    src={srcString} 
                    alt={alt || ''} 
                    className="rounded-lg mx-auto my-6 max-w-full h-auto shadow-sm block"
                    loading="lazy"
                  />
                );
              }
              
              // For local images, use Next.js Image component with inline-block display
              return (
                <span className="block my-6 text-center">
                  <Image
                    src={srcString}
                    alt={alt || ''}
                    width={800}
                    height={600}
                    className="rounded-lg shadow-sm inline-block"
                    style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                    priority={false}
                  />
                </span>
              );
            },
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </article>
  );
}