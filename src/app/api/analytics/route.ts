import { NextRequest, NextResponse } from 'next/server';
import { addPageView, getAnalyticsStats } from '@/lib/analytics';
import { requireAdminAuth } from '@/lib/auth';

// 페이지뷰 데이터 수집
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, title, referrer, utmSource, utmMedium, utmCampaign } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // 클라이언트 정보 수집
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor 
      ? forwardedFor.split(',')[0].trim()
      : realIp || 'unknown';

    try {
      const pageView = addPageView({
        path,
        title,
        userAgent,
        referrer: referrer || '',
        utmSource,
        utmMedium,
        utmCampaign,
        ip
      });

      return NextResponse.json({ success: true, id: pageView.id });
    } catch (analyticsError) {
      console.warn('페이지뷰 저장 실패:', analyticsError);
      // 서버리스 환경에서 파일 저장 실패 시에도 클라이언트에는 성공으로 응답
      return NextResponse.json({ success: true, id: 'temp-id', note: 'Analytics temporarily unavailable' });
    }

  } catch (error) {
    console.error('Analytics POST 오류:', error);
    return NextResponse.json(
      { error: 'Failed to record page view' },
      { status: 500 }
    );
  }
}

// Analytics 통계 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // JWT 토큰으로 관리자 권한 확인
    requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    try {
      const stats = getAnalyticsStats(days);
      
      return NextResponse.json({
        success: true,
        period: `${days} days`,
        stats
      });
    } catch (analyticsError) {
      console.warn('Analytics 통계 조회 실패:', analyticsError);
      // 서버리스 환경에서 파일 접근 실패 시 기본값 반환
      return NextResponse.json({
        success: true,
        period: `${days} days`,
        stats: {
          totalPageViews: 0,
          uniqueVisitors: 0,
          topPages: [],
          channels: [],
          recentViews: [],
          dailyStats: []
        },
        note: 'Analytics data temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('Analytics GET 오류:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
}