import 'dotenv/config';
import mongoose from 'mongoose';
import Question from '../models/Question';
import Tag from '../models/Tag';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qa-forum';

async function migrateTagsToNames() {
  await mongoose.connect(MONGODB_URI);
  const allTags = await Tag.find({}).lean();
  const tagIdToName = new Map(allTags.map(tag => [tag._id.toString(), tag.name]));

  const questions = await Question.find({});
  let updatedCount = 0;
  for (const question of questions) {
    let changed = false;
    const newTags = (question.tags || []).map((tag: any) => {
      if (typeof tag === 'string' && tagIdToName.has(tag)) {
        changed = true;
        return tagIdToName.get(tag);
      }
      if (typeof tag === 'object' && tag && tag._id && tagIdToName.has(tag._id.toString())) {
        changed = true;
        return tagIdToName.get(tag._id.toString());
      }
      return tag;
    });
    if (changed) {
      question.tags = newTags;
      await question.save();
      updatedCount++;
    }
  }
  await mongoose.disconnect();
  console.log(`Migration complete. Updated ${updatedCount} questions.`);
}

migrateTagsToNames().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 