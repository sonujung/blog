import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { unsubscribeByEmail, getSubscribers } from '@/lib/subscribers';
import { generateUnsubscribeConfirmEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    // 구독자 정보 조회 (구독 취소 전에)
    const subscribers = await getSubscribers();
    const subscriber = subscribers.find(sub => sub.email === email);

    if (!subscriber) {
      return NextResponse.json(
        { error: '해당 이메일 주소로 구독된 기록이 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 구독 취소된 경우
    if (subscriber.unsubscribed) {
      return NextResponse.json({
        message: '이미 구독이 취소된 이메일 주소입니다.',
        success: true
      });
    }

    // 구독 취소 처리
    const success = await unsubscribeByEmail(email);

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
          from: 'Sonu Jung <iam@sonujung.com>',
          to: [email],
          subject: confirmEmail.subject,
          html: confirmEmail.html,
          text: confirmEmail.text
        });

        console.log(`구독 취소 확인 이메일 발송 완료: ${email}`);
      }
    } catch (emailError) {
      console.error('구독 취소 확인 이메일 발송 실패:', emailError);
      // 이메일 발송 실패는 구독 취소 자체를 방해하지 않음
    }

    console.log(`구독 취소 처리 완료: ${email}`);

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