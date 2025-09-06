import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { unsubscribeByToken, getSubscribers } from '@/lib/subscribers';
import { generateUnsubscribeConfirmEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '구독 취소 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    // 구독자 정보 조회 (구독 취소 전에)
    const subscribers = getSubscribers();
    const subscriber = subscribers.find(sub => sub.unsubscribeToken === token);

    if (!subscriber) {
      return NextResponse.json(
        { error: '유효하지 않은 구독 취소 링크입니다.' },
        { status: 404 }
      );
    }

    // 이미 구독 취소된 경우
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        message: '이미 구독이 취소된 이메일 주소입니다.',
        success: true
      });
    }

    // 구독 취소 처리
    const success = unsubscribeByToken(token);

    if (!success) {
      return NextResponse.json(
        { error: '구독 취소 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 구독 취소 확인 이메일 발송 (옵셔널)
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const confirmEmail = generateUnsubscribeConfirmEmail(subscriber.email);

        await resend.emails.send({
          from: 'Sonu Jung <onboarding@resend.dev>',
          to: [subscriber.email],
          subject: confirmEmail.subject,
          html: confirmEmail.html,
          text: confirmEmail.text
        });

        console.log(`구독 취소 확인 이메일 발송 완료: ${subscriber.email}`);
      }
    } catch (emailError) {
      console.error('구독 취소 확인 이메일 발송 실패:', emailError);
      // 이메일 발송 실패는 구독 취소 자체를 방해하지 않음
    }

    console.log(`구독 취소 처리 완료: ${subscriber.email} (토큰: ${token})`);

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