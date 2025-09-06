import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { addSubscriber } from '@/lib/subscribers';
import { generateWelcomeEmail } from '@/lib/email-templates';

// Resend 클라이언트를 지연 초기화하는 함수
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 이메일 검증
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 주소 정규화
    const normalizedEmail = email.toLowerCase().trim();

    // 먼저 중복 체크
    const { getActiveSubscribers } = require('@/lib/subscribers');
    const existingSubscribers = getActiveSubscribers();
    if (existingSubscribers.some((sub: any) => sub.email === normalizedEmail)) {
      return NextResponse.json(
        { error: '이미 구독 중인 이메일 주소입니다.' },
        { status: 400 }
      );
    }

    // Resend API 키 확인
    if (!process.env.RESEND_API_KEY) {
      // API 키 없이도 구독자는 저장
      const subscriber = addSubscriber(normalizedEmail);
      return NextResponse.json({
        message: '구독이 완료되었습니다! (개발 모드: 이메일 API 키가 필요합니다)',
        success: true,
        devMode: true
      });
    }

    // Resend 클라이언트 초기화
    const resend = getResendClient();
    
    // 임시 구독자 객체 생성 (아직 저장하지 않음)
    const tempSubscriber = {
      id: Math.random().toString(36).substring(2, 15),
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      status: 'active' as const,
      unsubscribeToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    
    // 개선된 Welcome 이메일 생성 및 발송
    const emailTemplate = generateWelcomeEmail(tempSubscriber);
    
    const { data, error } = await resend.emails.send({
      from: 'Sonu Jung <onboarding@resend.dev>',
      to: [normalizedEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (error) {
      console.error('Resend 오류:', error);
      
      // 도메인 인증 관련 에러 처리 - 특별한 경우에만 구독자 저장
      if (error.message && error.message.includes('verify a domain')) {
        console.log('도메인 인증 필요 - 구독자는 저장하고 이메일은 스킵');
        const subscriber = addSubscriber(normalizedEmail);
        return NextResponse.json({
          message: '구독이 완료되었습니다! 도메인 인증 후 웰컴 이메일이 발송됩니다.',
          success: true,
          devMode: true
        });
      }
      
      // 다른 에러의 경우 구독자 저장하지 않음
      return NextResponse.json(
        { 
          error: '이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          details: error.message || '알 수 없는 오류'
        },
        { status: 500 }
      );
    }

    // 이메일 발송 성공 시에만 구독자 저장
    const subscriber = addSubscriber(normalizedEmail);

    console.log('구독 이메일 발송 성공:', { email: normalizedEmail, messageId: data?.id });

    return NextResponse.json({
      message: '구독해주셔서 감사합니다! 환영 이메일을 확인해보세요.',
      success: true
    });

  } catch (error) {
    console.error('구독 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}