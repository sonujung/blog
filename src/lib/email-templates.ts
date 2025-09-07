import type { Subscriber } from './subscribers';
import type { BlogPost as BlogPostType } from '@/types/blog';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export type BlogPost = BlogPostType;

// 기본 이메일 스타일
const baseStyles = {
  container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 0;
    background-color: #ffffff;
    color: #1f2937;
    line-height: 1.6;
  `,
  header: `
    padding: 32px 24px;
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
  `,
  logo: `
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    text-decoration: none;
    margin-bottom: 8px;
    display: inline-block;
  `,
  content: `
    padding: 32px 24px;
  `,
  footer: `
    padding: 24px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
    color: #6b7280;
    font-size: 14px;
  `,
  button: `
    display: inline-block;
    background-color: #111827;
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    font-size: 16px;
    margin: 16px 0;
  `,
  card: `
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  `
};

// 웰컴 이메일 템플릿
export function generateWelcomeEmail(subscriber: Subscriber): EmailTemplate {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
  const blogUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com';

  return {
    subject: 'Thanks for subscribing!',
    
    html: `
      <div style="${baseStyles.container}">
        <!-- Header -->
        <div style="${baseStyles.header}">
          <a href="${blogUrl}" style="${baseStyles.logo}">
            Sonu Jung
          </a>
        </div>

        <!-- Content -->
        <div style="${baseStyles.content}">
          <p style="font-size: 18px; color: #4b5563; text-align: center; margin-bottom: 32px;">
            Subscription confirmed for ${subscriber.email}
          </p>
        </div>

        <!-- Footer -->
        <div style="${baseStyles.footer}">
          <p style="margin: 0 0 8px 0;">
            © 2025 Sonu Jung
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,

    text: `
Thanks for subscribing!

Subscription confirmed for ${subscriber.email}

© 2025 Sonu Jung
Don't want to receive these emails? Unsubscribe: ${unsubscribeUrl}
    `
  };
}

// 새 포스트 알림 이메일 템플릿
export function generateNewPostEmail(post: BlogPost, subscriber: Subscriber): EmailTemplate {
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}/${post.slug}`;
  const blogUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com';
  const unsubscribeUrl = `${blogUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
  
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    subject: `${post.title}`,
    
    html: `
      <div style="${baseStyles.container}">
        <!-- Header -->
        <div style="${baseStyles.header}">
          <a href="${blogUrl}" style="${baseStyles.logo}">
            Sonu Jung
          </a>
        </div>

        <!-- Content -->
        <div style="${baseStyles.content}">
          <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px; line-height: 1.3;">
            ${post.title}
          </h1>

          <div style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            ${post.excerpt}
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${postUrl}" style="${baseStyles.button}">
              Read more
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="${baseStyles.footer}">
          <p style="margin: 0 0 8px 0;">
            © 2025 Sonu Jung
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,

    text: `
${post.title}

${post.excerpt}

Read more: ${postUrl}

© 2025 Sonu Jung
Don't want to receive these emails? Unsubscribe: ${unsubscribeUrl}
    `
  };
}

// 구독 취소 확인 이메일
export function generateUnsubscribeConfirmEmail(email: string): EmailTemplate {
  const blogUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com';
  const subscribeUrl = `${blogUrl}/subscribe`;

  return {
    subject: 'Unsubscribe confirmed',
    
    html: `
      <div style="${baseStyles.container}">
        <div style="${baseStyles.header}">
          <a href="${blogUrl}" style="${baseStyles.logo}">
            Sonu Jung
          </a>
        </div>

        <div style="${baseStyles.content}">
          <p style="font-size: 18px; color: #4b5563; text-align: center; margin-bottom: 32px;">
            Unsubscribe confirmed for ${email}
          </p>

          <p style="font-size: 16px; color: #6b7280; text-align: center; margin-bottom: 32px;">
            Thank you for being with us.<br>
            You're welcome back anytime.
          </p>

          <div style="text-align: center;">
            <a href="${subscribeUrl}" style="${baseStyles.button}">
              Subscribe again
            </a>
          </div>
        </div>

        <div style="${baseStyles.footer}">
          <p style="margin: 0 0 8px 0;">
            © 2025 Sonu Jung
          </p>
        </div>
      </div>
    `,

    text: `
Unsubscribe confirmed

Unsubscribe confirmed for ${email}

Thank you for being with us.
You're welcome back anytime.

Subscribe again: ${subscribeUrl}

© 2025 Sonu Jung
    `
  };
}