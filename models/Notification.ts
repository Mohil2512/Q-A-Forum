import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accept' | 'admin' | 'follow' | 'follow_request' | 'follow_accept';
  title: string;
  message: string;
  relatedQuestion?: mongoose.Types.ObjectId;
  relatedAnswer?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['answer', 'comment', 'mention', 'vote', 'accept', 'admin', 'follow', 'follow_request', 'follow_accept'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedQuestion: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
  },
  relatedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
  },
  relatedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema); 