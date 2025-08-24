import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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

    // Resend 클라이언트 초기화
    const resend = getResendClient();
    
    // Welcome 이메일 발송
    const { data, error } = await resend.emails.send({
      from: 'Sonu Jung <noreply@sonujung.com>',
      to: [normalizedEmail],
      subject: '🎉 sonujung.com 뉴스레터 구독해주셔서 감사합니다!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #374151;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; font-weight: 600; color: #111827; margin-bottom: 12px;">
              구독해주셔서 감사합니다! 🎉
            </h1>
            <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin: 0;">
              sonujung.com 뉴스레터에 성공적으로 구독되었습니다.
            </p>
          </div>

          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">
              앞으로 받아보실 콘텐츠
            </h2>
            <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>프로덕트 디자인 및 개발 인사이트</li>
              <li>스타트업과 기술 트렌드</li>
              <li>개발 도구와 워크플로우 팁</li>
              <li>독서 노트와 학습 내용 정리</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
              새로운 포스트가 발행되면 이메일로 알림을 보내드립니다.
            </p>
            <a href="https://sonujung.com" 
               style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
              블로그 둘러보기
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              구독을 원하지 않으시면 언제든지 
              <a href="#" style="color: #6b7280; text-decoration: underline;">구독 취소</a>할 수 있습니다.
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
              © 2024 Sonu Jung. 정선우의 블로그입니다.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend 오류:', error);
      return NextResponse.json(
        { error: '구독 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

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