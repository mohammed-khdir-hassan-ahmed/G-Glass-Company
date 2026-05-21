import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('🔐 Login attempt with username:', username);

    
    const adminUsername = 'hama1';
    const adminPassword = 'hama1';

    if (username === adminUsername && password === adminPassword) {
      console.log('✅ Credentials valid');
    
      const response = NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );

      
      response.cookies.set('adminAuth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
      });

      console.log('✅ Auth cookie set, response sent');
      return response;
    } else {
      console.error('❌ Invalid credentials - username:', username);
      return NextResponse.json(
        { success: false, message: 'ناویی بەکارهێنەر یان وشەی نهێنی هەڵەیە' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Login API error:', error);
    return NextResponse.json(
      { success: false, message: ' سێرڤەر: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
