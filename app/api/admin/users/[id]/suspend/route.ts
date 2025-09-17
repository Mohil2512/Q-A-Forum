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
    
    const { days, reason } = await request.json();
    
    if (!days || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Suspension period must be between 1 and 365 days' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent suspending master admin
    if (user.role === 'master') {
      return NextResponse.json(
        { error: 'Cannot suspend master administrator' },
        { status: 403 }
      );
    }

    // Calculate suspension end date
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + days);
    
    user.suspendedUntil = suspendedUntil;
    user.suspensionReason = reason || 'Violation of community guidelines';
    
    await user.save();
    
    return NextResponse.json({ 
      message: `User suspended for ${days} day(s)`,
      suspendedUntil: suspendedUntil.toISOString()
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
} 