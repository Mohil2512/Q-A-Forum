import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  content: string;
  shortDescription: string;
  author: mongoose.Types.ObjectId | string;
  tags: string[];
  images: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
  }[];
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
    type: Schema.Types.Mixed, // Allow ObjectId or string or null for anonymous
    ref: 'User',
    required: false, // Not required for anonymous questions
    default: null,
  },
  tags: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  }],
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    format: {
      type: String,
    },
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