import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const question = await Question.findById(params.id)
      .populate('author', 'username')
      .lean();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Increment views
    await Question.findByIdAndUpdate(params.id, { $inc: { views: 1 } });
    
    // Get answers for this question
    const answers = await Answer.find({ question: params.id })
      .populate('author', 'username')
      .sort({ isAccepted: -1, 'votes.upvotes': -1, createdAt: 1 })
      .lean();
    
    return NextResponse.json({
      question,
      answers,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    await dbConnect();
    const question = await Question.findById(params.id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
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
      isAuthorized = question.author.toString() === session.user.id || isAdmin;
    } else {
      const { anonUserId } = await request.json();
      if (anonUserId && typeof question.author === 'string' && question.author === anonUserId) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized to edit this question' },
        { status: 403 }
      );
    }
    const { title, content, tags, shortDescription } = await request.json();
    const updatedQuestion = await Question.findByIdAndUpdate(
      params.id,
      {
        title,
        content,
        shortDescription,
        tags: tags.map((tag: string) => tag.toLowerCase().trim()),
      },
      { new: true }
    ).populate('author', 'username');
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
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
    const question = await Question.findById(params.id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
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
      isAuthorized = question.author.toString() === session.user.id || isAdmin;
    } else {
      let anonUserId = undefined;
      try {
        const body = await request.json();
        anonUserId = body.anonUserId;
      } catch {}
      if (anonUserId && typeof question.author === 'string' && question.author === anonUserId) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized to delete this question' },
        { status: 403 }
      );
    }
    // Delete associated answers
    await Answer.deleteMany({ question: params.id });
    // Delete the question
    await Question.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
} 