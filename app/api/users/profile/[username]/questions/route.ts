import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/authOptions';
import connectDB from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import Question from '../../../../../../models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    console.log('Profile questions API called for username:', params.username);
    const session = await getServerSession(authOptions);
    await connectDB();
    console.log('Database connected successfully');

    const user: any = await User.findOne({ username: params.username }).lean();
    if (!user) {
      console.log('User not found:', params.username);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('User found:', user.username);

    const isOwner = session?.user?.id === user._id.toString();
    const isFollowing = session?.user?.id && user.followers?.includes(session.user.id);

    // Check if the current user can view this profile
    if (user.isPrivate && !isOwner && !isFollowing) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    console.log('Searching for questions for user:', user._id, user.username);

    const questions = await Question.find({
      $or: [
        { author: user._id },
        { realAuthor: user._id }
      ]
    })
      .populate('author', 'username displayName avatar')
      .select('title slug content tags votes views answers createdAt anonymous')
      .sort({ createdAt: -1 })
      .lean();

    const formattedQuestions = questions.map((question: any) => ({
      ...question,
      _id: question._id.toString(),
      votes: (question.votes?.upvotes?.length || 0) - (question.votes?.downvotes?.length || 0), // Calculate vote score
      author: question.author ? {
        ...question.author,
        _id: question.author._id.toString()
      } : null,
      tags: question.tags?.map((tagName: string) => ({
        _id: tagName,
        name: tagName
      })) || []
    }));

    console.log('Found questions:', questions.length, 'for user:', params.username);

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error('Error fetching user questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
