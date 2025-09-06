import { NextRequest, NextResponse } from 'next/server';
import { addPageView, getAnalyticsStats } from '@/lib/analytics';

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
    // 관리자 권한 확인 (간단한 방법)
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    const stats = getAnalyticsStats(days);
    
    return NextResponse.json({
      success: true,
      period: `${days} days`,
      stats
    });

  } catch (error) {
    console.error('Analytics GET 오류:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
}