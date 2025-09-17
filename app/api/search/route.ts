import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Question from '../../../models/Question';
import User from '../../../models/User';
import Tag from '../../../models/Tag';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        users: [], 
        questions: [], 
        tags: [] 
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Search users (excluding banned users and including only public profiles or followed ones)
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: searchRegex },
            { displayName: searchRegex },
            { bio: searchRegex }
          ]
        },
        { isBanned: false },
        { 
          $or: [
            { isPrivate: false },
            { isPrivate: { $exists: false } }
          ]
        }
      ]
    })
    .select('username displayName bio avatar')
    .limit(5)
    .lean();

    // Search questions
    const questions = await Question.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
    .populate('author', 'username displayName avatar')
    .populate('tags', 'name')
    .select('title slug author tags votes createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Search tags
    const tags = await Tag.find({
      name: searchRegex
    })
    .select('name description questionsCount')
    .sort({ questionsCount: -1 })
    .limit(5)
    .lean();

    return NextResponse.json({
      users: users.map((user: any) => ({
        ...user,
        _id: user._id.toString()
      })),
      questions: questions.map((question: any) => ({
        ...question,
        _id: question._id.toString(),
        author: question.author ? {
          ...question.author,
          _id: question.author._id.toString()
        } : null,
        tags: question.tags?.map((tag: any) => ({
          ...tag,
          _id: tag._id.toString()
        })) || []
      })),
      tags: tags.map((tag: any) => ({
        ...tag,
        _id: tag._id.toString()
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
