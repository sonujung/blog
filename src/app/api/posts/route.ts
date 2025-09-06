import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/markdown';

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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