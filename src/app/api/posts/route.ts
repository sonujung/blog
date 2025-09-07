import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/markdown';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // JWT 토큰으로 관리자 권한 확인
    requireAdminAuth(request);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const posts = await getAllPosts();
    const limitedPosts = posts.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      posts: limitedPosts,
      total: posts.length
    });

  } catch (error) {
    console.error('Posts API 오류:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}