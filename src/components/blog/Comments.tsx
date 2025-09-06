'use client';

import { useEffect, useRef } from 'react';

interface CommentsProps {
  slug: string;
}

export default function Comments({ slug }: CommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debug environment variables
    console.log('Giscus Environment Variables:', {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
      repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID
    });
    
    // Temporarily disabled until Giscus setup is fixed
    if (!process.env.NEXT_PUBLIC_GISCUS_REPO_ID) {
      console.log('Giscus disabled: No REPO_ID found');
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', process.env.NEXT_PUBLIC_GISCUS_REPO || 'sonujung/blog');
    script.setAttribute('data-repo-id', process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'github_light');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    if (commentsRef.current) {
      commentsRef.current.appendChild(script);
    }

    return () => {
      if (commentsRef.current) {
        commentsRef.current.innerHTML = '';
      }
    };
  }, [slug]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h3 className="text-xl font-semibold text-gray-900 mb-8">Comments</h3>
      <div ref={commentsRef} />
    </div>
  );
}