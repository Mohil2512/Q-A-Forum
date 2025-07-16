import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { username, email, password, phoneCountry, phoneNumber } = await request.json();
    
    // Validation
    if (!username || !email || !password || !phoneCountry || !phoneNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      );
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }
    if (phoneCountry.length < 2 || phoneCountry.length > 5) {
      return NextResponse.json(
        { error: 'Country code is invalid' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      phoneCountry,
      phoneNumber,
      role: 'user',
      reputation: 0,
    });

    await user.save();

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 