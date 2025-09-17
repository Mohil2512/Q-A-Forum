import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get('id') || searchParams.get('username');

  if (!identifier) {
    return NextResponse.json({ message: 'User ID or username is required' }, { status: 400 });
  }

  try {
    await connectDB();
    
    let user;
    
    // Check if identifier is a valid ObjectId (24 hex characters)
    if (mongoose.Types.ObjectId.isValid(identifier) && identifier.length === 24) {
      // Search by ID
      user = await User.findById(identifier)
        .populate('followers', 'name email avatar username')
        .populate('following', 'name email avatar username')
        .select('-password -__v');
    } else {
      // Search by username
      user = await User.findOne({ username: identifier })
        .populate('followers', 'name email avatar username')
        .populate('following', 'name email avatar username')
        .select('-password -__v');
    }

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get user's stats
    const questionCount = await Question.countDocuments({ author: user._id });
    const answerCount = await Answer.countDocuments({ author: user._id });

    // Get follow status if user is logged in
    let followStatus = 'none';
    let canViewProfile = true;
    let isOwner = false;
    
    if (session?.user?.email) {
      const currentUser = await User.findOne({ email: session.user.email });
      if (currentUser) {
        isOwner = currentUser._id.toString() === user._id.toString();
        
        if (!isOwner) {
          if (user.isPrivate) {
            const isFollowing = user.followers.some(
              (follower: any) => follower._id.toString() === currentUser._id.toString()
            );
            const hasPendingRequest = user.pendingFollowRequests.includes(currentUser._id);
            
            if (isFollowing) {
              followStatus = 'following';
              canViewProfile = true;
            } else if (hasPendingRequest) {
              followStatus = 'pending';
              canViewProfile = false;
            } else {
              followStatus = 'none';
              canViewProfile = false;
            }
          } else {
            const isFollowing = user.followers.some(
              (follower: any) => follower._id.toString() === currentUser._id.toString()
            );
            const hasPendingRequest = user.pendingFollowRequests.includes(currentUser._id);
            
            if (isFollowing) {
              followStatus = 'following';
            } else if (hasPendingRequest) {
              followStatus = 'pending';
            } else {
              followStatus = 'none';
            }
            canViewProfile = true;
          }
        } else {
          canViewProfile = true;
          followStatus = 'owner';
        }
      }
    } else {
      canViewProfile = !user.isPrivate;
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      avatar: user.avatar,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      questionCount,
      answerCount,
      location: user.location || '',
      website: user.website || '',
      joinDate: user.createdAt,
      isPrivate: user.isPrivate,
      canViewProfile,
      followStatus,
      isOwner,
      pendingFollowRequests: isOwner ? user.pendingFollowRequests : [],
      ...(canViewProfile && !user.isPrivate ? {
        followers: user.followers,
        following: user.following,
      } : {})
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
