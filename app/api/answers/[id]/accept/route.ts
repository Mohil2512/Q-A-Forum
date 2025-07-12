import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const answer = await Answer.findById(params.id).populate('question author');
    
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    
    const question = await Question.findById(answer.question._id);
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the question author
    if (question.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the question author can accept answers' },
        { status: 403 }
      );
    }

    // Check if question already has an accepted answer
    if (question.isAccepted) {
      return NextResponse.json(
        { error: 'Question already has an accepted answer' },
        { status: 400 }
      );
    }
    
    // Update answer and question
    await Promise.all([
      Answer.findByIdAndUpdate(params.id, { isAccepted: true }),
      Question.findByIdAndUpdate(question._id, { 
        isAccepted: true, 
        acceptedAnswer: params.id 
      }),
    ]);

    // Update reputation for answer author (+50 reputation for accepted answer)
    const answerAuthor = await User.findById(answer.author._id);
    if (answerAuthor) {
      answerAuthor.reputation += 50;
      answerAuthor.acceptedAnswers += 1;
      await answerAuthor.save();
    }

    // Create notification for answer author
    await Notification.create({
      recipient: answer.author._id,
      sender: session.user.id,
      type: 'accept',
      title: 'Your answer was accepted!',
      message: `Your answer to "${question.title}" was accepted by the question author.`,
      relatedQuestion: question._id,
      relatedAnswer: answer._id,
    });
    
    return NextResponse.json({ 
      message: 'Answer accepted successfully',
      reputationGained: 50
    });
  } catch (error) {
    console.error('Error accepting answer:', error);
    return NextResponse.json(
      { error: 'Failed to accept answer' },
      { status: 500 }
    );
  }
} 