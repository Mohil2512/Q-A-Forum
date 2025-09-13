import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer extends Document {
  content: string;
  images: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
  }[];
  author: mongoose.Types.ObjectId | string;
  question: mongoose.Types.ObjectId;
  votes: {
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
  };
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  realAuthor: mongoose.Types.ObjectId;
  anonymous: boolean;
  anonymousId: string;
  anonymousName: string;
}

const answerSchema = new Schema<IAnswer>({
  content: {
    type: String,
    required: true,
    minlength: 10,
  },
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
  author: {
    type: Schema.Types.Mixed, // Allow ObjectId or string or null for anonymous
    ref: 'User',
    required: false, // Not required for anonymous answers
    default: null,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
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
  isAccepted: {
    type: Boolean,
    default: false,
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

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', answerSchema); 