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

    // Resend Audience에서 중복 체크
    try {
      const { getActiveSubscribers } = await import('@/lib/subscribers');
      const existingSubscribers = await getActiveSubscribers();
      if (existingSubscribers.some((sub: any) => sub.email === normalizedEmail)) {
        return NextResponse.json(
          { error: '이미 구독 중인 이메일 주소입니다.' },
          { status: 400 }
        );
      }
    } catch (apiError) {
      console.warn('Resend API 접근 실패, 중복 체크를 건너뜁니다:', apiError);
      // Resend API 오류 시 구독 진행
    }

    // Resend API 키 확인
    if (!process.env.RESEND_API_KEY) {
      // API 키 없이도 구독자는 저장
      try {
        const subscriber = addSubscriber(normalizedEmail);
      } catch (storageError) {
        console.warn('구독자 저장 실패:', storageError);
      }
      return NextResponse.json({
        message: '구독이 완료되었습니다! 곧 웰컴 이메일이 발송될 예정입니다.',
        success: true,
        note: 'Resend API 키 설정이 필요합니다.'
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
      from: 'Sonu Jung <iam@sonujung.com>',
      to: [normalizedEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (error) {
      console.error('Resend 오류:', error);
      
      // 도메인 인증 관련 에러 처리
      const errorMsg = error.message || error.error || '';
      if (errorMsg && (
        errorMsg.includes('verify a domain') ||
        errorMsg.includes('domain verification') ||
        errorMsg.includes('not verified') ||
        errorMsg.includes('DNS') ||
        errorMsg.includes('domain is not verified') ||
        error.statusCode === 403
      )) {
        console.log('도메인 인증 필요 - 구독자는 Audience에 저장하고 이메일은 스킵');
        try {
          const subscriber = await addSubscriber(normalizedEmail);
        } catch (apiError) {
          console.warn('Resend Audience 추가 실패:', apiError);
        }
        return NextResponse.json({
          message: '구독이 완료되었습니다! 곧 웰컴 이메일이 발송될 예정입니다.',
          success: true,
          note: 'Resend 도메인 인증이 필요합니다.'
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
    try {
      const subscriber = addSubscriber(normalizedEmail);
      console.log('구독 이메일 발송 성공:', { email: normalizedEmail, messageId: data?.id });
    } catch (storageError) {
      console.warn('구독자 저장 실패 (이메일은 발송됨):', storageError);
      // 저장 실패해도 이메일은 발송되었으므로 성공으로 처리
    }

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