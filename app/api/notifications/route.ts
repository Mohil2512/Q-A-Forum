import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import pusher from '@/lib/pusher';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const notifications = await Notification.find({
      recipient: session.user.id
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    await dbConnect();
    const { recipient, sender, type, title, message, relatedQuestion, relatedAnswer } = await request.json();
    if (!recipient || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedQuestion,
      relatedAnswer,
    });
    // Trigger Pusher event for real-time notification
    await pusher.trigger(`user-${recipient}`, 'new-notification', {
      notification: {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        relatedQuestion: notification.relatedQuestion,
        relatedAnswer: notification.relatedAnswer,
      }
    });
    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
} 