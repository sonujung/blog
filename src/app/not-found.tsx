import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-semibold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 mb-6">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          
          <div className="text-sm text-gray-500">
            또는{' '}
            <Link href="/search" className="text-gray-700 hover:text-gray-900 underline">
              검색
            </Link>
            을 이용해보세요
          </div>
        </div>
      </div>
    </div>
  );
}