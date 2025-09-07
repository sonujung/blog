import { NextRequest, NextResponse } from 'next/server';
import { getSubscribers, getSubscriberStats, updateSubscriberStatus } from '@/lib/subscribers';
import { requireAdminAuth } from '@/lib/auth';

// 구독자 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // JWT 토큰으로 관리자 권한 확인
    requireAdminAuth(request);

    try {
      const subscribers = await getSubscribers();
      const stats = await getSubscriberStats();
      
      return NextResponse.json({
        success: true,
        subscribers,
        stats
      });
    } catch (apiError) {
      console.warn('Resend API 접근 실패:', apiError);
      // Resend API 접근 실패 시 빈 데이터 반환
      return NextResponse.json({
        success: true,
        subscribers: [],
        stats: {
          total: 0,
          active: 0,
          unsubscribed: 0
        },
        note: 'Resend API temporarily unavailable'
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
    // JWT 토큰으로 관리자 권한 확인
    requireAdminAuth(request);

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
      // Resend API를 통해 구독자 상태 업데이트
      const unsubscribed = action === 'unsubscribe';
      const success = await updateSubscriberStatus(id, unsubscribed);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update subscriber status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: action === 'unsubscribe' ? '구독이 해지되었습니다.' : '구독이 재활성화되었습니다.'
      });

    } catch (apiError) {
      console.warn('Resend API 업데이트 실패:', apiError);
      return NextResponse.json(
        { error: 'Failed to update subscriber via Resend API' },
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