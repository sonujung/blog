'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsProps {
  title?: string;
}

export default function Analytics({ title }: AnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지뷰 추적
    const trackPageView = async () => {
      try {
        // URL에서 UTM 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || undefined;
        const utmMedium = urlParams.get('utm_medium') || undefined;
        const utmCampaign = urlParams.get('utm_campaign') || undefined;

        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            title: title || document.title,
            referrer: document.referrer,
            utmSource,
            utmMedium,
            utmCampaign,
          }),
        });
      } catch (error) {
        // Analytics 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
        console.debug('Analytics tracking failed:', error);
      }
    };

    // 페이지 로드 시 추적
    trackPageView();
  }, [pathname, title]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}

// 개발 환경에서는 추적하지 않는 옵션 컴포넌트
export function AnalyticsOptional({ title }: AnalyticsProps) {
  // 프로덕션 환경에서만 추적
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  
  return <Analytics title={title} />;
}