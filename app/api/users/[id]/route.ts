import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Question from '@/models/Question';
import Answer from '@/models/Answer';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  try {
    await connectDB();
    
    const userId = params.id;
    const user = await User.findById(userId)
      .populate('followers', 'name email avatar')
      .populate('following', 'name email avatar')
      .select('-password -__v');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get user's stats
    const questionCount = await Question.countDocuments({ author: userId });
    const answerCount = await Answer.countDocuments({ author: userId });
    
    // Calculate reputation (simplified formula)
    const questions = await Question.find({ author: userId });
    const answers = await Answer.find({ author: userId });
    
    let reputation = 0;
    questions.forEach(q => reputation += (q.upvotes || 0) - (q.downvotes || 0));
    answers.forEach(a => reputation += (a.upvotes || 0) - (a.downvotes || 0));
    answers.forEach(a => reputation += a.isAccepted ? 15 : 0); // Bonus for accepted answers

    // Get follow status if user is logged in
    let followStatus = 'none';
    let canViewProfile = true;
    let isOwner = false;
    
    if (session?.user?.email) {
      const currentUser = await User.findOne({ email: session.user.email });
      if (currentUser) {
        isOwner = currentUser._id.toString() === userId;
        
        if (!isOwner) {
          if (user.isPrivate) {
            const isFollowing = user.followers.some(
              (follower: any) => follower._id.toString() === currentUser._id.toString()
            );
            const hasPendingRequest = user.pendingFollowRequests.includes(currentUser._id);
            
            if (isFollowing) {
              followStatus = 'following';
            } else if (hasPendingRequest) {
              followStatus = 'pending';
            } else {
              followStatus = 'not_following';
              canViewProfile = false; // Can't view private profiles unless following
            }
          } else {
            const isFollowing = user.followers.some(
              (follower: any) => follower._id.toString() === currentUser._id.toString()
            );
            followStatus = isFollowing ? 'following' : 'not_following';
          }
        }
      }
    } else if (user.isPrivate) {
      canViewProfile = false; // Anonymous users can't view private profiles
    }

    // Prepare response data
    const responseData: any = {
      _id: user._id,
      name: user.name,
      email: isOwner ? user.email : undefined, // Only show email to owner
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      joinDate: user.createdAt,
      isPrivate: user.isPrivate,
      reputation,
      stats: {
        questions: questionCount,
        answers: answerCount,
        followers: user.followers.length,
        following: user.following.length,
      },
      followStatus,
      isOwner,
      canViewProfile,
    };

    // Include follower/following details only if can view profile and is owner or following
    if (canViewProfile && (isOwner || followStatus === 'following')) {
      responseData.followers = user.followers;
      responseData.following = user.following;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    
    const userId = params.id;
    const currentUser = await User.findOne({ email: session.user.email });
    
    if (!currentUser || currentUser._id.toString() !== userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'bio', 'location', 'website', 'isPrivate', 'avatar'];
    const filteredUpdates: any = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      filteredUpdates, 
      { new: true, select: '-password -__v' }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
