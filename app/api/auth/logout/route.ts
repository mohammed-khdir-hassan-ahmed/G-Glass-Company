import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear authentication cookie
    response.cookies.set('adminAuth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // This expires the cookie
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error logging out' },
      { status: 500 }
    );
  }
}
