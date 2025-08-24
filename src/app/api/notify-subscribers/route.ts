import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getActiveSubscribers } from '@/lib/subscribers';
import { getPostBySlug } from '@/lib/markdown';

// Resend 클라이언트를 지연 초기화하는 함수
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { postSlug } = await request.json();

    if (!postSlug) {
      return NextResponse.json(
        { error: '포스트 슬러그가 필요합니다.' },
        { status: 400 }
      );
    }

    // 포스트 정보 조회
    const post = await getPostBySlug(postSlug);
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // published 상태가 아니면 알림 발송하지 않음
    if (post.status !== 'published') {
      return NextResponse.json(
        { error: '발행되지 않은 포스트입니다.' },
        { status: 400 }
      );
    }

    // 활성 구독자 조회
    const activeSubscribers = getActiveSubscribers();
    
    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        message: '활성 구독자가 없습니다.',
        success: true,
        count: 0
      });
    }

    // Resend 클라이언트 초기화
    const resend = getResendClient();

    // 포스트 요약 생성 (첫 200자)
    const excerpt = post.excerpt || 
      post.content.replace(/[#*`]/g, '').substring(0, 200).trim() + '...';

    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}/blog/${post.slug}`;
    const coverImageUrl = post.coverImage ? 
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}${post.coverImage}` : null;

    // 모든 구독자에게 이메일 발송
    const emailPromises = activeSubscribers.map(subscriber => 
      resend.emails.send({
        from: 'Sonu Jung <onboarding@resend.dev>',
        to: [subscriber.email],
        subject: `📖 새 포스트: ${post.title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #374151;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 28px; font-weight: 600; color: #111827; margin-bottom: 12px;">
                새 포스트가 발행되었습니다! 📖
              </h1>
              <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin: 0;">
                sonujung.com에 새로운 글이 올라왔어요.
              </p>
            </div>

            ${coverImageUrl ? `
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="${coverImageUrl}" 
                     alt="${post.title}" 
                     style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
              </div>
            ` : ''}

            <div style="background: #f9fafb; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
              <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px; line-height: 1.3;">
                ${post.title}
              </h2>
              <p style="color: #4b5563; line-height: 1.8; margin: 0; font-size: 16px;">
                ${excerpt}
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 32px;">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                전체 내용을 읽으려면 아래 버튼을 클릭하세요.
              </p>
              <a href="${postUrl}" 
                 style="display: inline-block; background: #111827; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                포스트 읽기 →
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                이 이메일은 sonujung.com 뉴스레터를 구독하신 분께 발송되었습니다.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
                구독을 원하지 않으시면 
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}/unsubscribe?token=${subscriber.unsubscribeToken}" style="color: #6b7280; text-decoration: underline;">여기를 클릭</a>하여 구독을 취소할 수 있습니다.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
                © 2024 Sonu Jung. 정선우의 블로그입니다.
              </p>
            </div>
          </div>
        `
      })
    );

    // 모든 이메일 발송 완료 대기
    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.filter(result => result.status === 'rejected').length;

    if (failureCount > 0) {
      console.error(`이메일 발송 실패: ${failureCount}개`);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`구독자 ${activeSubscribers[index].email} 발송 실패:`, result.reason);
        }
      });
    }

    console.log(`새 포스트 알림 발송 완료: ${post.title}`);
    console.log(`성공: ${successCount}개, 실패: ${failureCount}개`);

    return NextResponse.json({
      message: `새 포스트 알림이 발송되었습니다.`,
      success: true,
      post: {
        title: post.title,
        slug: post.slug
      },
      stats: {
        total: activeSubscribers.length,
        success: successCount,
        failure: failureCount
      }
    });

  } catch (error) {
    console.error('새 포스트 알림 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}