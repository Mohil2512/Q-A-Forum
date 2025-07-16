import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  await dbConnect();
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
  }
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return NextResponse.json({ message: 'Password reset successfully' });
} 