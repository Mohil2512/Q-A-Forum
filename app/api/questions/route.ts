import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 50);
    const tag = searchParams.get('tag');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    const sort = searchParams.get('sort') || 'newest';
    const filter = searchParams.get('filter') || 'all';
    
    const skip = (page - 1) * limit;
    
    let query: any = {};
    let sortObj: any = {};
    
    // Tag filter - handle both single tag and multiple tags
    if (tag) {
      query.tags = tag;
    } else if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length === 1) {
        query.tags = tagArray[0];
      } else if (tagArray.length > 1) {
        query.tags = { $in: tagArray };
      }
    }
    
    // Author filter
    if (author) {
      query.author = author;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Advanced filters
    if (filter === 'unanswered') {
      query.answers = 0;
    } else if (filter === 'accepted') {
      query.isAccepted = true;
    }
    
    // Build sort object
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'popular':
        sortObj = { views: -1 };
        break;
      case 'votes':
        sortObj = { 'votes.upvotes': -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
    
    // Get questions with simplified logic
    const questions = await Question.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Process questions to handle authors properly
    const processedQuestions = await Promise.all(
      questions.map(async (question: any) => {
        let authorInfo;
        
        if (question.anonymous) {
          // For anonymous questions, show dummy username
          authorInfo = {
            username: question.anonymousName || 'Anonymous',
            reputation: 0,
            _id: 'anonymous'
          };
        } else if (question.author) {
          // For regular questions, populate author
          try {
            const author = await User.findById(question.author).select('username reputation').lean();
            authorInfo = author || {
              username: 'Unknown User',
              reputation: 0,
              _id: 'unknown'
            };
          } catch (error) {
            console.error('Error populating author:', error);
            authorInfo = {
              username: 'Unknown User',
              reputation: 0,
              _id: 'unknown'
            };
          }
        } else {
          // Fallback for missing author
          authorInfo = {
            username: 'Unknown User',
            reputation: 0,
            _id: 'unknown'
          };
        }

        return {
          ...question,
          author: authorInfo,
          voteCount: (question.votes?.upvotes?.length || 0) - (question.votes?.downvotes?.length || 0),
          tags: question.tags || [],
          answers: question.answers || 0
        };
      })
    );

    const total = await Question.countDocuments(query);
    
    return NextResponse.json({
      questions: processedQuestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Enhanced authentication check
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please sign in to ask a question' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    const body = await request.json();
    const { 
      title, 
      content, 
      tags, 
      shortDescription, 
      images, 
      anonymous, 
      anonymousDisplayName, 
      realAuthor 
    } = body;

    if (!title || !content || !tags || tags.length === 0) {
      return NextResponse.json(
        { error: 'Title, content, and tags are required' },
        { status: 400 }
      );
    }

    // Find the authenticated user with better error handling
    let user;
    try {
      user = await User.findById(session.user.id);
    } catch (error) {
      console.error('Error finding user:', error);
      return NextResponse.json(
        { error: 'Invalid user session. Please sign out and sign in again.' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found. Please sign out and sign in again.' },
        { status: 404 }
      );
    }
    
    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned' },
        { status: 403 }
      );
    }
    
    // Check if user is suspended
    if (user.suspendedUntil && new Date() < user.suspendedUntil) {
      return NextResponse.json(
        { error: 'Your account is currently suspended' },
        { status: 403 }
      );
    }

    // Create the question
    const questionData = {
      title,
      content,
      shortDescription,
      tags,
      images: images || [],
      author: anonymous ? null : session.user.id, // Show as anonymous or real user
      realAuthor: session.user.id, // Always store real author for admin
      anonymous: anonymous || false,
      anonymousName: anonymous ? anonymousDisplayName : null,
      votes: { upvotes: [], downvotes: [] },
      views: 0,
      answers: 0,
      isAccepted: false,
    };
    
    const question = new Question(questionData);
    await question.save();

    // Update user reputation and stats
    user.reputation += 50;
    user.questionsAsked += 1;
    await user.save();

    // Populate the question for response (show appropriate author)
    let populatedQuestion: any;
    if (anonymous) {
      populatedQuestion = await Question.findById(question._id).lean();
      if (populatedQuestion) {
        // Replace author info with anonymous display for response
        populatedQuestion.author = {
          username: anonymousDisplayName,
          reputation: 0,
          _id: 'anonymous'
        };
      }
    } else {
      populatedQuestion = await Question.findById(question._id)
        .populate('author', 'username reputation')
        .lean();
    }

    return NextResponse.json({
      ...populatedQuestion,
      reputationGained: 50
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
} 