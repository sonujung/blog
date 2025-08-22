'use client';

import { useState, useEffect } from 'react';
import { getAllPosts } from '@/lib/notion';
import { searchPosts } from '@/lib/search';
import { BlogPost, SearchResult } from '@/types/blog';
import PostItem from '@/components/blog/PostItem';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchPosts(posts, query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, posts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-2xl mx-auto px-4 py-8 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-xl font-semibold text-black hover:text-gray-600 transition-colors">
          sonujung.com
        </Link>
        <nav className="flex gap-4">
          <span className="text-gray-900 text-sm font-medium">Search</span>
          <Link href="/subscribe" className="text-gray-600 hover:text-black text-sm transition-colors">
            Subscribe
          </Link>
        </nav>
      </header>

      {/* Search Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Search Input */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">검색</h1>
          <input
            type="text"
            placeholder="포스트 제목, 내용, 태그로 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
            autoFocus
          />
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">포스트를 불러오는 중...</p>
          </div>
        ) : query.trim() === '' ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색어를 입력해보세요.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">&ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-8">
              &ldquo;{query}&rdquo; 검색 결과 ({results.length}개)
            </h2>
            {results.map(({ post }) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 border-t border-gray-100">
        <p className="text-gray-400 text-sm">
          © 2024 Sonu Jung. 학구적이고 미니멀한 개발 블로그.
        </p>
      </footer>
    </div>
  );
}