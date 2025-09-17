import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const user = await User.findByIdAndUpdate(
      params.id,
      { isBanned: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    );
  }
} 