// API route to set admin token cookie (called after successful login)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  const response = NextResponse.json({ success: true });
  
  if (token) {
    // Set cookie with token
    response.cookies.set('adminToken', token, {
      httpOnly: false, // Allow client-side access if needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } else {
    // Delete cookie if token is empty
    response.cookies.delete('adminToken');
  }

  return response;
}
