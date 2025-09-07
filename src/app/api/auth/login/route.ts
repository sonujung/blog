import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!adminPassword || !jwtSecret) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: '잘못된 비밀번호입니다.' },
        { status: 401 }
      );
    }
    
    // JWT 토큰 생성 (24시간 유효)
    const token = jwt.sign(
      { 
        admin: true,
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    const response = NextResponse.json(
      { success: true, message: '로그인 성공' },
      { status: 200 }
    );
    
    // httpOnly 쿠키로 토큰 설정
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24시간
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}