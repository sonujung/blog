import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function verifyAdminToken(request: NextRequest): boolean {
  try {
    const token = request.cookies.get('admin_token')?.value;
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!token || !jwtSecret) {
      return false;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    return decoded.admin === true;
    
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export function requireAdminAuth(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    throw new Error('Unauthorized');
  }
}