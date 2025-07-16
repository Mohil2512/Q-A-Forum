import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer extends Document {
  content: string;
  images: string[];
  author: mongoose.Types.ObjectId | string;
  question: mongoose.Types.ObjectId;
  votes: {
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
  };
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  content: {
    type: String,
    required: true,
    minlength: 10,
  },
  images: [{
    type: String,
    maxlength: 1024, // 1MB max
  }],
  author: {
    type: Schema.Types.Mixed, // Allow ObjectId or string
    ref: 'User',
    required: true,
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
}, {
  timestamps: true,
});

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', answerSchema); 