'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = '뉴스레터 구독 | sonujung';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('이메일을 입력해주세요.');
      return;
    }

    if (!email.includes('@')) {
      setStatus('error');
      setMessage('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '구독 처리 중 오류가 발생했습니다.');
      }

      setStatus('success');
      setMessage(data.message || '구독해주셔서 감사합니다! 환영 이메일을 확인해보세요.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : '구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-2xl mx-auto px-4 py-8 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-xl font-semibold text-black hover:text-gray-600 transition-colors">
          Sonu Jung
        </Link>
        <nav className="flex gap-4">
          <span className="text-gray-900 text-sm font-medium">Subscribe</span>
        </nav>
      </header>

      {/* Subscribe Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">뉴스레터 구독</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              새로운 포스트가 발행되면 이메일로 알림을 받아보세요.
            </p>
          </header>

          {/* Subscribe Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium
                       hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? '구독 중...' : status === 'success' ? '구독 완료!' : '구독하기'}
            </button>

            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-lg text-center ${
                status === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">
              구독자의 개인정보는 안전하게 보호되며, 언제든지 구독을 취소할 수 있습니다.
            </p>
            
            <div className="flex justify-center gap-6 text-sm">
              <Link 
                href="/api/rss" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                RSS 피드
              </Link>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                블로그 홈으로
              </Link>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}