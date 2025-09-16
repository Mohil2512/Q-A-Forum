import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

// Follow a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (currentUser._id.toString() === userId) {
      return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return NextResponse.json({ message: 'Already following this user' }, { status: 400 });
    }

    // Check if there's a pending request
    if (targetUser.pendingFollowRequests.includes(currentUser._id)) {
      return NextResponse.json({ message: 'Follow request already sent' }, { status: 400 });
    }

    if (targetUser.isPrivate) {
      // Send follow request for private accounts
      targetUser.pendingFollowRequests.push(currentUser._id);
      currentUser.sentFollowRequests.push(userId);
      
      await targetUser.save();
      await currentUser.save();

      // Create notification for follow request
      await Notification.create({
        recipient: userId,
        sender: currentUser._id,
        type: 'follow_request',
        title: 'New Follow Request',
        message: `${currentUser.name || currentUser.email} wants to follow you`,
        relatedUser: currentUser._id,
      });

      return NextResponse.json({ 
        message: 'Follow request sent', 
        status: 'pending' 
      });
    } else {
      // Follow immediately for public accounts
      currentUser.following.push(userId);
      targetUser.followers.push(currentUser._id);
      
      await currentUser.save();
      await targetUser.save();

      // Create notification for new follower
      await Notification.create({
        recipient: userId,
        sender: currentUser._id,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.name || currentUser.email} is now following you`,
        relatedUser: currentUser._id,
      });

      return NextResponse.json({ 
        message: 'Successfully followed user', 
        status: 'following' 
      });
    }
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const currentUser = await User.findOne({ email: session.user.email });
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      (id: any) => id.toString() !== userId
    );
    targetUser.followers = targetUser.followers.filter(
      (id: any) => id.toString() !== currentUser._id.toString()
    );

    // Remove from pending requests if exists
    currentUser.sentFollowRequests = currentUser.sentFollowRequests.filter(
      (id: any) => id.toString() !== userId
    );
    targetUser.pendingFollowRequests = targetUser.pendingFollowRequests.filter(
      (id: any) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json({ 
      message: 'Successfully unfollowed user' 
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
