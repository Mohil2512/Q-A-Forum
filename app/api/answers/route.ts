import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import dbConnect from '@/lib/mongodb';
import Answer from '@/models/Answer';
import Question from '@/models/Question';
import User from '@/models/User';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const questionId = searchParams.get('questionId');
    
    let query: any = {};
    
    if (author) {
      query.author = author;
    }
    
    if (questionId) {
      query.question = questionId;
    }
    
    const answers = await Answer.find(query)
      .populate('author', 'username reputation')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
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
        { error: 'Please sign in to post an answer' },
        { status: 401 }
      );
    }

    await dbConnect();
    const formData = await request.formData();
    
    const content = formData.get('content') as string;
    const questionId = formData.get('questionId') as string;
    const anonymous = formData.get('anonymous') === 'true';
    const imageFiles = formData.getAll('images') as File[];

    if (!content || !questionId) {
      return NextResponse.json(
        { error: 'Content and question ID are required' },
        { status: 400 }
      );
    }

    // Validate content length before any processing
    if (content.length < 10) {
      return NextResponse.json(
        { error: `Answer must be at least 10 characters long. Current length: ${content.length}` },
        { status: 400 }
      );
    }

    // Find the authenticated user with better error handling
    let user;
    try {
      user = await User.findById(session.user.id);
      console.log('Found user for answer creation:', { userId: user?._id, username: user?.username });
    } catch (error) {
      console.error('Error finding user:', error);
      return NextResponse.json(
        { error: 'Invalid user session. Please sign out and sign in again.' },
        { status: 400 }
      );
    }

    if (!user) {
      console.error('User not found in database:', session.user.id);
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

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Generate anonymous display name if posting anonymously
    const anonymousDisplayName = anonymous 
      ? `Anonymous${Math.floor(Math.random() * 10000)}` 
      : null;

    // Process images only if there are files to upload
    let processedImages = [];
    let uploadedImageIds = []; // Keep track for cleanup on error
    
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (!file.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'All files must be images' },
            { status: 400 }
          );
        }
        
        if (file.size > 2 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Each image must be less than 2MB' },
            { status: 400 }
          );
        }
        
        try {
          const uploadResult = await uploadToCloudinary(file, 'qa-forum');
          processedImages.push({
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
          });
          uploadedImageIds.push(uploadResult.publicId);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          
          // Cleanup any already uploaded images
          for (const publicId of uploadedImageIds) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (cleanupError) {
              console.error('Error cleaning up uploaded image:', cleanupError);
            }
          }
          
          return NextResponse.json(
            { error: 'Failed to upload one or more images' },
            { status: 500 }
          );
        }
      }
    }

    // Create the answer
    const answerData = {
      content,
      images: processedImages,
      author: anonymous ? null : user._id,
      realAuthor: user._id, // Always store real author for admin
      question: questionId,
      anonymous: anonymous || false,
      anonymousName: anonymous ? anonymousDisplayName : null,
      votes: { upvotes: [], downvotes: [] },
      isAccepted: false,
    };
    
    console.log('Creating answer with data:', {
      contentLength: content.length,
      hasImages: processedImages.length > 0,
      anonymous,
      questionId,
      authorId: answerData.author,
      realAuthorId: answerData.realAuthor
    });

    let answer;
    try {
      answer = new Answer(answerData);
      await answer.save();
      console.log('Answer created successfully:', answer._id);
    } catch (saveError: any) {
      console.error('Error saving answer:', saveError);
      
      // Cleanup uploaded images if answer creation failed
      for (const publicId of uploadedImageIds) {
        try {
          await deleteFromCloudinary(publicId);
          console.log('Cleaned up image after failed answer creation:', publicId);
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded image:', cleanupError);
        }
      }
      
      // Handle validation errors with user-friendly messages
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map((err: any) => {
          if (err.kind === 'minlength') {
            return `Answer must be at least ${err.properties.minlength} characters long. Current length: ${err.properties.value?.length || 0}`;
          }
          return err.message;
        });
        
        return NextResponse.json(
          { error: validationErrors.join('. ') },
          { status: 400 }
        );
      }
      
      throw saveError; // Re-throw non-validation errors
    }

    // Update user reputation and stats
    user.reputation += 100;
    user.answersGiven += 1;
    await user.save();

    console.log('User stats updated');

    // Update question answer count
    await Question.findByIdAndUpdate(questionId, {
      $inc: { answers: 1 }
    });

    // Create notification if different user
    if (question.realAuthor && question.realAuthor.toString() !== session.user.id) {
      try {
        await Notification.create({
          recipient: question.realAuthor,
          sender: session.user.id,
          type: 'answer',
          title: 'New Answer',
          message: anonymous 
            ? `Someone answered your question anonymously: "${question.title}"`
            : `${user.username} answered your question: "${question.title}"`,
          relatedQuestion: questionId,
          relatedAnswer: answer._id,
        });
        console.log('Notification created for question author');
      } catch (notificationError) {
        // Don't fail the answer creation if notification fails
        console.error('Failed to create notification:', notificationError);
      }
    }

    // Prepare response data
    const responseData = {
      ...answer.toObject(),
      author: anonymous ? {
        username: anonymousDisplayName,
        reputation: 0,
        _id: 'anonymous'
      } : {
        username: user.username,
        reputation: user.reputation,
        _id: user._id.toString()
      },
      reputationGained: 100
    };

    console.log('Answer creation completed successfully');
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating answer:', error);
    
    // Handle validation errors with user-friendly messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => {
        if (err.kind === 'minlength') {
          return `Answer must be at least ${err.properties.minlength} characters long. Current length: ${err.properties.value.length}`;
        }
        return err.message;
      });
      
      return NextResponse.json(
        { error: validationErrors.join('. ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create answer. Please try again.' },
      { status: 500 }
    );
  }
} 