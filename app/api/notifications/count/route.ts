import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }
    
    await dbConnect();
    
    const count = await Notification.countDocuments({
      recipient: session.user.id,
      isRead: false
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json({ count: 0 });
  }
} 