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
    
    // Force enable Giscus for testing
    console.log('Giscus: Force enabled for debugging');
    
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    // Use hardcoded values for testing
    script.setAttribute('data-repo', 'sonujung/blog');
    script.setAttribute('data-repo-id', 'R_kgDOGnoNtQ');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOGnoNtc4Cuena');
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
    
    script.onload = () => {
      console.log('Giscus script loaded successfully');
    };
    
    script.onerror = (error) => {
      console.error('Giscus script failed to load:', error);
    };

    if (commentsRef.current) {
      console.log('Appending Giscus script to DOM');
      commentsRef.current.appendChild(script);
    } else {
      console.error('Comments ref is null');
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
      {/* Temporarily show setup message - remove after GitHub Discussions is enabled */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          💬 댓글 시스템을 설정 중입니다. GitHub Discussions를 활성화해야 합니다.
          <br />
          <a 
            href="https://github.com/sonujung/blog/settings" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            저장소 설정에서 Discussions 활성화하기 →
          </a>
        </p>
      </div>
      <div ref={commentsRef} />
    </div>
  );
}