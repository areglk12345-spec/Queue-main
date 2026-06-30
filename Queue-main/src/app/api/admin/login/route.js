import { NextResponse } from 'next/server';
import { verify } from 'otplib';
import { SignJWT } from 'jose';

export async function POST(request) {
  try {
    const { pin } = await request.json();
    const secret = process.env.ADMIN_TOTP_SECRET;

    if (!secret) {
      return NextResponse.json({ error: '2FA not configured on server' }, { status: 500 });
    }

    // In otplib v13, verify returns a VerifyResult object: { valid: boolean, delta: number }
    // We must check the 'valid' property.
    const result = await verify({
      token: pin,
      secret: secret,
    });

    const isValid = result && result.valid === true;

    console.log(`2FA Attempt - PIN: ${pin}, Valid: ${isValid}`);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    // Generate JWT
    const jwtSecret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback-secret-change-me'
    );
    
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(jwtSecret);

    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7200, // 2 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
