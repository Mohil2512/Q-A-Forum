import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('OAuth callback test endpoint hit');
  console.log('URL:', request.url);
  console.log('Search params:', request.nextUrl.searchParams.toString());
  
  return NextResponse.json({
    message: 'OAuth callback route is working',
    url: request.url,
    params: Object.fromEntries(request.nextUrl.searchParams.entries())
  });
}
