import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITag extends Document {
  name: string;
  count: number;
  description?: string;
}

const TagSchema: Schema<ITag> = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  count: { type: Number, default: 0 },
  description: { type: String }
});

const Tag: Model<ITag> = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);

export default Tag; 