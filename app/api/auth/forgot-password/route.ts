import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  await dbConnect();
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    // For security, do not reveal if the email exists
    return NextResponse.json({ message: 'If an account with that email exists, a reset link will be sent.' });
  }

  // Generate token and expiry
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour

  user.resetPasswordToken = token;
  user.resetPasswordExpires = tokenExpiry;
  await user.save();

  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset for your account.</p>
           <p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>
           <p>If you did not request this, please ignore this email.</p>`
  });

  return NextResponse.json({ message: 'If an account with that email exists, a reset link will be sent.' });
} 