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
    
    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'master')) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove suspension
    user.suspendedUntil = undefined;
    user.suspensionReason = undefined;
    
    await user.save();
    
    return NextResponse.json({ 
      message: 'User suspension removed successfully'
    });
  } catch (error) {
    console.error('Error removing user suspension:', error);
    return NextResponse.json(
      { error: 'Failed to remove user suspension' },
      { status: 500 }
    );
  }
} 