import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'master';
  avatar?: string;
  bio?: string;
  displayName?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  location?: string;
  isBanned: boolean;
  suspendedUntil?: Date;
  suspensionReason?: string;
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  isPrivate: boolean;
  followers: string[];
  following: string[];
  pendingFollowRequests: string[];
  sentFollowRequests: string[];
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  phoneCountry?: string;
  phoneNumber?: string;
  oauthProvider?: string;
  provider?: string;
  providerId?: string;
  anonymousId?: string;
  anonymousName?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      // Only require password if not using OAuth
      return !this.provider && !this.oauthProvider;
    },
    minlength: 6,
  },
  oauthProvider: {
    type: String, // e.g., 'google', 'github'
  },
  provider: {
    type: String, // e.g., 'google', 'github'
  },
  providerId: {
    type: String, // e.g., '112939889456037758176'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'master'],
    default: 'user',
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  github: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  linkedin: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  twitter: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  suspendedUntil: {
    type: Date,
  },
  suspensionReason: {
    type: String,
    maxlength: 500,
  },
  questionsAsked: {
    type: Number,
    default: 0,
  },
  answersGiven: {
    type: Number,
    default: 0,
  },
  acceptedAnswers: {
    type: Number,
    default: 0,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  pendingFollowRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  sentFollowRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Number,
  },
  phoneCountry: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
  },
  anonymousId: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    index: true,
  },
  anonymousName: {
    type: String,
    maxlength: 50,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 