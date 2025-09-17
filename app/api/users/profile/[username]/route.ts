import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Question from '../../../../../models/Question';
import Answer from '../../../../../models/Answer';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    const user = await User.findOne({ username: params.username })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean() as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = session?.user?.id === user._id.toString();
    
    // Get the current user's actual database ID for accurate comparison
    let currentUserId = null;
    if (session?.user?.email) {
      const currentUserFromDB = await User.findOne({ email: session.user.email }).select('_id');
      currentUserId = currentUserFromDB?._id.toString();
    }
    
    const isFollowing = currentUserId && user.followers?.some((followerId: any) => 
      followerId.toString() === currentUserId
    );
    const hasPendingRequest = currentUserId && user.pendingFollowRequests?.some((requesterId: any) => 
      requesterId.toString() === currentUserId
    );

    // Check if the current user can view this profile
    let canViewProfile = true;
    let followStatus = 'none';

    if (user.isPrivate && !isOwner) {
      canViewProfile = isFollowing;
      if (hasPendingRequest) {
        followStatus = 'pending';
      } else if (isFollowing) {
        followStatus = 'following';
      } else {
        followStatus = 'not_following';
      }
    } else if (!isOwner && session?.user?.id) {
      if (isFollowing) {
        followStatus = 'following';
      } else {
        followStatus = 'not_following';
      }
    }

    // Get user stats
    const [questionsCount, answersCount, acceptedAnswersCount] = await Promise.all([
      Question.countDocuments({
        $or: [
          { author: user._id },
          { realAuthor: user._id }
        ]
      }),
      Answer.countDocuments({ author: user._id }),
      Answer.countDocuments({ author: user._id, isAccepted: true }),
    ]);

    const userProfile = {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      email: isOwner ? user.email : undefined, // Only show email to owner
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      github: user.github,
      linkedin: user.linkedin,
      twitter: user.twitter,
      joinDate: user.createdAt,
      isPrivate: user.isPrivate,
      stats: {
        questionsAsked: questionsCount,
        answersGiven: answersCount,
        acceptedAnswers: acceptedAnswersCount,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
      },
      followStatus,
      isOwner,
      canViewProfile,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
