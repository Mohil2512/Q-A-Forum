import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { username, email, phoneCountry, phoneNumber, displayName, bio, github, linkedin, twitter, location } = await request.json();

  if (!username || !email) {
    return NextResponse.json({ error: 'Username and email are required' }, { status: 400 });
  }
  if (!phoneCountry) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    return NextResponse.json({ error: 'Phone number must be 10 digits' }, { status: 400 });
  }

  try {
    // Check for duplicate username or email
    const existingUser = await User.findOne({
      $or: [
        { username, _id: { $ne: session.user.id } },
        { email, _id: { $ne: session.user.id } }
      ]
    });
    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { username, email, phoneCountry, phoneNumber, displayName, bio, github, linkedin, twitter, location },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return updated user data
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phoneCountry: user.phoneCountry,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        role: user.role,
        reputation: user.reputation
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 