'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    async function handleUnsubscribe() {
      if (!token) {
        setStatus('error');
        setMessage('유효하지 않은 구독 취소 링크입니다.');
        return;
      }

      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(result.message);
        } else {
          setStatus('error');
          setMessage(result.error || '구독 취소 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('구독 취소 오류:', error);
        setStatus('error');
        setMessage('서버 연결 오류가 발생했습니다.');
      }
    }

    handleUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              구독 취소 처리 중...
            </h1>
            <p className="text-gray-600">
              잠시만 기다려주세요.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              구독이 취소되었습니다
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              더 이상 새 포스트 알림을 받지 않으실 수 있습니다. 언제든지 다시 구독하실 수 있습니다.
            </p>
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full bg-gray-900 text-white text-center py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                홈으로 돌아가기
              </a>
              <a
                href="/subscribe"
                className="block w-full border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                다시 구독하기
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="rounded-full bg-red-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              구독 취소 실패
            </h1>
            <p className="text-red-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              문제가 계속 발생하면 직접 문의해 주세요.
            </p>
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full bg-gray-900 text-white text-center py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                홈으로 돌아가기
              </a>
              <a
                href="mailto:hello@sonujung.com"
                className="block w-full border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                문의하기
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              페이지 로딩 중...
            </h1>
            <p className="text-gray-600">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}