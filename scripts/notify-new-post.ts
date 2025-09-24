import 'dotenv/config'
import { Resend } from 'resend'
import { getPostBySlug } from '../src/lib/markdown'
import { getActiveSubscribers } from '../src/lib/subscribers'
import { generateNewPostEmail } from '../src/lib/email-templates'

async function notifyNewPost(postSlug: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY 환경변수가 설정되어 있지 않습니다.')
      process.exit(1)
    }

    console.log(`📧 새 포스트 알림 발송 시작: ${postSlug}`)

    const post = await getPostBySlug(postSlug)
    if (!post) {
      console.error(`❌ 포스트를 찾을 수 없습니다: ${postSlug}`)
      process.exit(1)
    }

    if (post.status !== 'published') {
      console.error(`❌ 발행되지 않은 포스트입니다: ${postSlug} (상태: ${post.status})`)
      process.exit(1)
    }

    const subscribers = await getActiveSubscribers()
    if (subscribers.length === 0) {
      console.log('ℹ️ 활성 구독자가 없어 이메일을 발송하지 않습니다.')
      process.exit(0)
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const batchSize = 10
    let successCount = 0
    let errorCount = 0

    console.log(`✅ 포스트: ${post.title}`)
    console.log(`👥 활성 구독자 수: ${subscribers.length}명`)

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      const results = await Promise.allSettled(
        batch.map(async (subscriber) => {
          const email = generateNewPostEmail(post, subscriber)
          const listUnsubscribe = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`

          const { error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Sonu Jung <iam@sonujung.com>',
            to: [subscriber.email],
            subject: email.subject,
            html: email.html,
            text: email.text,
            headers: {
              'List-Unsubscribe': `<${listUnsubscribe}>`
            }
          })

          if (error) {
            const message = (error as { message?: string })?.message || JSON.stringify(error)
            throw new Error(message)
          }

          console.log(`✅ 발송 완료: ${subscriber.email}`)
        })
      )

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successCount += 1
        } else {
          errorCount += 1
          console.error(`❌ 발송 실패: ${result.reason}`)
        }
      })

      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log('🎉 알림 발송 완료!')
    console.log(`   • 성공: ${successCount}건`)
    console.log(`   • 실패: ${errorCount}건`)
    process.exit(0)
  } catch (error) {
    console.error('❌ 알림 발송 중 오류:', error)
    process.exit(1)
  }
}

const postSlug = process.argv[2]

if (!postSlug) {
  console.error('사용법: npm run notify-post <post-slug>')
  console.error('예시: npm run notify-post stockdale-paradox')
  process.exit(1)
}

notifyNewPost(postSlug)
