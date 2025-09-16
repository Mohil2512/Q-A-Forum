import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

// Accept follow request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const { requesterId } = await req.json();
    
    if (!requesterId) {
      return NextResponse.json({ message: 'Requester ID is required' }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    const requester = await User.findById(requesterId);

    if (!currentUser || !requester) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if there's a pending request
    if (!currentUser.pendingFollowRequests.includes(requesterId)) {
      return NextResponse.json({ message: 'No pending follow request found' }, { status: 400 });
    }

    // Accept the follow request
    currentUser.pendingFollowRequests = currentUser.pendingFollowRequests.filter(
      (id: any) => id.toString() !== requesterId
    );
    currentUser.followers.push(requesterId);
    
    requester.sentFollowRequests = requester.sentFollowRequests.filter(
      (id: any) => id.toString() !== currentUser._id.toString()
    );
    requester.following.push(currentUser._id);

    await currentUser.save();
    await requester.save();

    // Create notification for accepted follow request
    await Notification.create({
      recipient: requesterId,
      sender: currentUser._id,
      type: 'follow_accept',
      title: 'Follow Request Accepted',
      message: `${currentUser.name || currentUser.email} accepted your follow request`,
      relatedUser: currentUser._id,
    });

    return NextResponse.json({ 
      message: 'Follow request accepted' 
    });
  } catch (error) {
    console.error('Accept follow request error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Reject follow request
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const url = new URL(req.url);
    const requesterId = url.searchParams.get('requesterId');
    
    if (!requesterId) {
      return NextResponse.json({ message: 'Requester ID is required' }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    const requester = await User.findById(requesterId);

    if (!currentUser || !requester) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Remove the pending request
    currentUser.pendingFollowRequests = currentUser.pendingFollowRequests.filter(
      (id: any) => id.toString() !== requesterId
    );
    
    requester.sentFollowRequests = requester.sentFollowRequests.filter(
      (id: any) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await requester.save();

    return NextResponse.json({ 
      message: 'Follow request rejected' 
    });
  } catch (error) {
    console.error('Reject follow request error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
