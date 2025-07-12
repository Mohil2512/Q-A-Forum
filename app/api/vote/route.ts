import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { type, itemId, voteType } = await request.json();
    
    if (!type || !itemId || !voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(session.user.id);
    
    if (!user || user.isBanned) {
      return NextResponse.json(
        { error: 'User not found or banned' },
        { status: 403 }
      );
    }
    
    let item;
    let updateField;
    
    if (type === 'question') {
      item = await Question.findById(itemId);
      updateField = 'votes';
    } else if (type === 'answer') {
      item = await Answer.findById(itemId);
      updateField = 'votes';
    } else {
      return NextResponse.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Check if user already voted
    const hasUpvoted = item.votes.upvotes.includes(session.user.id);
    const hasDownvoted = item.votes.downvotes.includes(session.user.id);
    
    let updateQuery: any = {};
    
    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        updateQuery[`${updateField}.upvotes`] = session.user.id;
        await item.updateOne({ $pull: updateQuery });
      } else {
        // Add upvote, remove downvote if exists
        updateQuery[`${updateField}.upvotes`] = session.user.id;
        await item.updateOne({ 
          $addToSet: updateQuery,
          $pull: { [`${updateField}.downvotes`]: session.user.id }
        });
      }
    } else {
      if (hasDownvoted) {
        // Remove downvote
        updateQuery[`${updateField}.downvotes`] = session.user.id;
        await item.updateOne({ $pull: updateQuery });
      } else {
        // Add downvote, remove upvote if exists
        updateQuery[`${updateField}.downvotes`] = session.user.id;
        await item.updateOne({ 
          $addToSet: updateQuery,
          $pull: { [`${updateField}.upvotes`]: session.user.id }
        });
      }
    }
    
    // Update user reputation if voting on answer
    if (type === 'answer' && item.author.toString() !== session.user.id) {
      const reputationChange = voteType === 'upvote' ? 10 : -2;
      await User.findByIdAndUpdate(item.author, { $inc: { reputation: reputationChange } });
    }
    
    const updatedItem = await (type === 'question' ? Question : Answer)
      .findById(itemId)
      .populate('author', 'username reputation')
      .lean();
    
    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Item not found after update' },
        { status: 404 }
      );
    }
    
    // Return vote counts separately
    const response = {
      ...updatedItem,
      voteCounts: {
        upvotes: (updatedItem as any).votes.upvotes.length,
        downvotes: (updatedItem as any).votes.downvotes.length,
        total: (updatedItem as any).votes.upvotes.length - (updatedItem as any).votes.downvotes.length
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
} 