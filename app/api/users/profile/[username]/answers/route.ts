import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/authOptions';
import connectDB from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import Answer from '../../../../../../models/Answer';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    const user: any = await User.findOne({ username: params.username }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = session?.user?.id === user._id.toString();
    const isFollowing = session?.user?.id && user.followers?.includes(session.user.id);

    // Check if the current user can view this profile
    if (user.isPrivate && !isOwner && !isFollowing) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const answers = await Answer.find({ author: user._id })
      .populate('question', 'title slug')
      .select('content isAccepted votes question createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formattedAnswers = answers.map((answer: any) => ({
      ...answer,
      _id: answer._id.toString(),
      votes: (answer.votes?.upvotes?.length || 0) - (answer.votes?.downvotes?.length || 0), // Calculate vote score
      question: answer.question ? {
        ...answer.question,
        _id: answer.question._id.toString()
      } : null
    }));

    return NextResponse.json({ answers: formattedAnswers });
  } catch (error) {
    console.error('Error fetching user answers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
