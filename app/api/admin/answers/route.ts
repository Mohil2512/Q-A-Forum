import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const answers = await Answer.find({})
      .populate('author', 'username')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
} 