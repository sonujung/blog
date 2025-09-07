import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'),
  title: {
    default: "Sonu Jung",
    template: "%s | Sonu Jung"
  },
  description: "정선우의 블로그입니다.",
  keywords: ["개발", "블로그", "프로그래밍", "기술", "소프트웨어", "개발자"],
  authors: [{ name: "Sonu Jung", url: "https://sonujung.com" }],
  creator: "Sonu Jung",
  publisher: "Sonu Jung",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com',
    title: "Sonu Jung",
    description: "정선우의 블로그입니다.",
    siteName: "sonujung.com",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sonu Jung",
    description: "정선우의 블로그입니다.",
    creator: "@sonujung",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com',
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sonujung.com'}/api/rss`,
    },
  },
  verification: {
    google: '', // Google Search Console 인증 코드 (나중에 추가)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Analytics />
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
