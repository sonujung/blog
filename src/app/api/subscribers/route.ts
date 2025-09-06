import { NextRequest, NextResponse } from 'next/server';
import { getSubscribers, getSubscriberStats, saveSubscribers } from '@/lib/subscribers';

// 구독자 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const subscribers = getSubscribers();
      const stats = getSubscriberStats();
      
      return NextResponse.json({
        success: true,
        subscribers,
        stats
      });
    } catch (fileError) {
      console.warn('구독자 데이터 로드 실패:', fileError);
      // 서버리스 환경에서 파일 접근 실패 시 빈 데이터 반환
      return NextResponse.json({
        success: true,
        subscribers: [],
        stats: {
          total: 0,
          active: 0,
          unsubscribed: 0
        },
        note: 'Subscriber data temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('구독자 조회 API 오류:', error);
    return NextResponse.json(
      { error: 'Failed to get subscribers' },
      { status: 500 }
    );
  }
}

// 구독자 상태 업데이트 (관리자용)
export async function PATCH(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'unsubscribe' && action !== 'resubscribe') {
      return NextResponse.json(
        { error: 'Action must be "unsubscribe" or "resubscribe"' },
        { status: 400 }
      );
    }

    try {
      const subscribers = getSubscribers();
      const subscriber = subscribers.find(sub => sub.id === id);
      
      if (!subscriber) {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 }
        );
      }

      // 상태 업데이트
      if (action === 'unsubscribe') {
        subscriber.status = 'unsubscribed';
      } else if (action === 'resubscribe') {
        subscriber.status = 'active';
        subscriber.subscribedAt = new Date().toISOString(); // 재구독 시간 업데이트
      }

      // 파일에 저장
      saveSubscribers(subscribers);

      return NextResponse.json({
        success: true,
        message: action === 'unsubscribe' ? '구독이 해지되었습니다.' : '구독이 재활성화되었습니다.',
        subscriber
      });

    } catch (fileError) {
      console.warn('구독자 데이터 업데이트 실패:', fileError);
      return NextResponse.json(
        { error: 'Failed to update subscriber data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('구독자 업데이트 API 오류:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}