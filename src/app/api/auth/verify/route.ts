import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!token || !jwtSecret) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (decoded.admin) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}