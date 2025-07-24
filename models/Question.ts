import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  content: string;
  shortDescription: string;
  author: mongoose.Types.ObjectId | string;
  tags: string[];
  images: string[];
  votes: {
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
  };
  views: number;
  answers: number;
  isAccepted: boolean;
  acceptedAnswer?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  realAuthor: mongoose.Types.ObjectId;
  anonymous: boolean;
  anonymousId: string;
  anonymousName: string;
}

const questionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    minlength: 20,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200,
  },
  author: {
    type: Schema.Types.Mixed, // Allow ObjectId or string
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  }],
  images: [{
    type: String,
    maxlength: 1024, // 1MB max
  }],
  votes: {
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  views: {
    type: Number,
    default: 0,
  },
  answers: {
    type: Number,
    default: 0,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
  },
  realAuthor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  anonymousId: {
    type: String,
  },
  anonymousName: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for search functionality
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema); 