import { getPostBySlug } from '../src/lib/markdown';

// 새 포스트 발행 시 구독자에게 알림을 보내는 스크립트
async function notifyNewPost(postSlug: string) {
  try {
    console.log(`📧 새 포스트 알림 발송 시작: ${postSlug}`);
    
    // 포스트 정보 확인
    const post = await getPostBySlug(postSlug);
    if (!post) {
      console.error(`❌ 포스트를 찾을 수 없습니다: ${postSlug}`);
      process.exit(1);
    }
    
    if (post.status !== 'published') {
      console.error(`❌ 발행되지 않은 포스트입니다: ${postSlug} (상태: ${post.status})`);
      process.exit(1);
    }
    
    console.log(`✅ 포스트 정보 확인: ${post.title}`);
    
    // API 엔드포인트 호출
    const response = await fetch('http://localhost:3000/api/notify-subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postSlug: postSlug
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`❌ API 호출 실패:`, result.error);
      process.exit(1);
    }
    
    console.log(`🎉 알림 발송 완료!`);
    console.log(`📊 통계:`);
    console.log(`  - 전체 구독자: ${result.stats.total}명`);
    console.log(`  - 성공: ${result.stats.success}명`);
    console.log(`  - 실패: ${result.stats.failure}명`);
    
  } catch (error) {
    console.error('❌ 알림 발송 중 오류:', error);
    process.exit(1);
  }
}

// 커맨드라인에서 포스트 슬러그 받기
const postSlug = process.argv[2];

if (!postSlug) {
  console.error('사용법: npm run notify-post <post-slug>');
  console.error('예시: npm run notify-post stockdale-paradox');
  process.exit(1);
}

notifyNewPost(postSlug);