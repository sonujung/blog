import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getActiveSubscribers } from '@/lib/subscribers';
import { generateNewPostEmail, type BlogPost } from '@/lib/email-templates';
import { getAllPosts } from '@/lib/markdown';

// Resend 클라이언트를 지연 초기화하는 함수
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { slug, action } = await request.json();

    // 액션 검증
    if (action !== 'notify' || !slug) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }

    // API 키 검증 (보안)
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.NOTIFICATION_API_KEY;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 포스트 정보 조회
    const allPosts = await getAllPosts();
    const post = allPosts.find(p => p.slug === slug);

    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 활성 구독자 조회
    const activeSubscribers = await getActiveSubscribers();
    
    console.log(`🔍 구독자 조회 결과: ${activeSubscribers.length}명 발견`);
    
    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        message: '알림을 보낼 구독자가 없습니다.',
        sent: 0
      });
    }

    console.log(`📧 ${activeSubscribers.length}명의 구독자에게 새 포스트 알림 발송 시작: ${post.title}`);

    // Resend 클라이언트 초기화
    const resend = getResendClient();
    
    // 블로그 포스트 객체는 이미 올바른 형태이므로 그대로 사용
    const blogPost: BlogPost = post;

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 구독자별로 개인화된 이메일 발송 (배치 처리)
    const batchSize = 10; // Resend 제한에 맞춰 조정
    
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (subscriber) => {
        try {
          const emailTemplate = generateNewPostEmail(blogPost, subscriber);
          
          const { data, error } = await resend.emails.send({
            from: 'Sonu Jung <onboarding@resend.dev>',
            to: [subscriber.email],
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            headers: {
              'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}>`
            }
          });

          if (error) {
            throw new Error(`Resend 오류: ${JSON.stringify(error)}`);
          }

          console.log(`✅ 이메일 발송 성공: ${subscriber.email} (ID: ${data?.id})`);
          return { success: true, email: subscriber.email };
          
        } catch (error) {
          console.error(`❌ 이메일 발송 실패: ${subscriber.email}`, error);
          return { 
            success: false, 
            email: subscriber.email, 
            error: error instanceof Error ? error.message : '알 수 없는 오류' 
          };
        }
      });

      // 배치 실행 및 결과 처리
      const results = await Promise.allSettled(batchPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`${result.value.email}: ${result.value.error}`);
          }
        } else {
          errorCount++;
          errors.push(`배치 처리 오류: ${result.reason}`);
        }
      });

      // API 제한 방지를 위한 대기 (배치 사이)
      if (i + batchSize < activeSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 알림 발송 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);

    return NextResponse.json({
      message: `새 포스트 알림을 발송했습니다.`,
      post: {
        title: post.title,
        slug: post.slug
      },
      stats: {
        totalSubscribers: activeSubscribers.length,
        sent: successCount,
        failed: errorCount,
        errors: errorCount > 0 ? errors : undefined
      },
      success: true
    });

  } catch (error) {
    console.error('구독자 알림 API 오류:', error);
    return NextResponse.json(
      { 
        error: '알림 발송 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// GET 요청으로 구독자 통계 조회
export async function GET() {
  try {
    const activeSubscribers = await getActiveSubscribers();
    
    return NextResponse.json({
      totalActiveSubscribers: activeSubscribers.length,
      recentSubscribers: activeSubscribers
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(sub => ({
          email: sub.email.replace(/(.{2}).*@/, '$1***@'), // 이메일 마스킹
          subscribedAt: sub.created_at
        }))
    });
  } catch (error) {
    console.error('구독자 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}