import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';
import User from '@/models/User';
import Question from '@/models/Question';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    await dbConnect();
    const answer = await Answer.findById(params.id);
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    // Allow edit if:
    // - Authenticated user and is author or admin
    // - Anonymous: anonUserId in body matches author (string)
    let isAuthorized = false;
    let isAdmin = false;
    if (session?.user?.id) {
      isAdmin = session.user.role === 'admin';
      isAuthorized = answer.author.toString() === session.user.id || isAdmin;
    } else {
      const { anonUserId } = await request.json();
      if (anonUserId && typeof answer.author === 'string' && answer.author === anonUserId) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized to edit this answer' },
        { status: 403 }
      );
    }
    const { content, images } = await request.json();
    answer.content = content;
    answer.images = images || [];
    await answer.save();
    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error updating answer:', error);
    return NextResponse.json(
      { error: 'Failed to update answer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    await dbConnect();
    const answer = await Answer.findById(params.id);
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    // Allow delete if:
    // - Authenticated user and is author or admin
    // - Anonymous: anonUserId in body matches author (string)
    let isAuthorized = false;
    let isAdmin = false;
    if (session?.user?.id) {
      isAdmin = session.user.role === 'admin';
      isAuthorized = answer.author.toString() === session.user.id || isAdmin;
    } else {
      let anonUserId = undefined;
      try {
        const body = await request.json();
        anonUserId = body.anonUserId;
      } catch {}
      if (anonUserId && typeof answer.author === 'string' && answer.author === anonUserId) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized to delete this answer' },
        { status: 403 }
      );
    }
    
    // Store the question ID before deleting the answer
    const questionId = answer.question;
    
    await Answer.findByIdAndDelete(params.id);
    
    // Decrement the answers counter on the question
    await Question.findByIdAndUpdate(
      questionId,
      { $inc: { answers: -1 } }
    );
    
    return NextResponse.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    return NextResponse.json(
      { error: 'Failed to delete answer' },
      { status: 500 }
    );
  }
} 