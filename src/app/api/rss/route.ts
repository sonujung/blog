import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/notion';
import { generateRSS } from '@/lib/rss';

export async function GET(request: NextRequest) {
  try {
    const posts = await getAllPosts();
    const rss = generateRSS(posts);

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    );
  }
}