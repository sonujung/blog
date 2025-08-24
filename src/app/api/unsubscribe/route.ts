import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/subscribers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '구독 취소 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    // 구독 취소 처리
    const success = unsubscribeByToken(token);

    if (!success) {
      return NextResponse.json(
        { error: '유효하지 않은 구독 취소 링크입니다.' },
        { status: 404 }
      );
    }

    console.log(`구독 취소 처리 완료: 토큰 ${token}`);

    return NextResponse.json({
      message: '구독이 성공적으로 취소되었습니다.',
      success: true
    });

  } catch (error) {
    console.error('구독 취소 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}