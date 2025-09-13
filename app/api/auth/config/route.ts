import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'Not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'Not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'Not set',
    GITHUB_ID: process.env.GITHUB_ID ? 'Set (hidden)' : 'Not set',
    GITHUB_SECRET: process.env.GITHUB_SECRET ? 'Set (hidden)' : 'Not set',
    MONGODB_URI: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set'
  };

  return NextResponse.json({
    status: 'OAuth Configuration Check',
    environment: process.env.NODE_ENV,
    config,
    recommendations: {
      google: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? 
        'Google OAuth is configured' : 
        'Google OAuth needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local',
      github: process.env.GITHUB_ID && process.env.GITHUB_SECRET ? 
        'GitHub OAuth is configured' : 
        'GitHub OAuth needs GITHUB_ID and GITHUB_SECRET in .env.local',
      callback_url: 'Make sure your OAuth provider redirect URL is set to: http://localhost:3000/api/auth/callback/[provider]'
    }
  });
}
