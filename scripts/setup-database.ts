import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import models
import User from '../models/User';
import Question from '../models/Question';
import Answer from '../models/Answer';
import Notification from '../models/Notification';
import Tag from '../models/Tag';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Answer.deleteMany({}),
      Notification.deleteMany({}),
      Tag.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Create indexes
    console.log('📊 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isBanned: 1 });
    await User.collection.createIndex({ suspendedUntil: 1 });

    // Question indexes
    // Drop existing text indexes to avoid conflicts
    await Question.collection.dropIndexes();
    await Question.collection.createIndex({ title: 'text', content: 'text' });
    await Question.collection.createIndex({ author: 1 });
    await Question.collection.createIndex({ tags: 1 });
    await Question.collection.createIndex({ createdAt: -1 });
    await Question.collection.createIndex({ views: -1 });
    await Question.collection.createIndex({ 'votes.upvotes': 1 });
    await Question.collection.createIndex({ 'votes.downvotes': 1 });
    await Question.collection.createIndex({ isAccepted: 1 });

    // Answer indexes
    await Answer.collection.createIndex({ question: 1 });
    await Answer.collection.createIndex({ author: 1 });
    await Answer.collection.createIndex({ createdAt: -1 });
    await Answer.collection.createIndex({ 'votes.upvotes': 1 });
    await Answer.collection.createIndex({ 'votes.downvotes': 1 });
    await Answer.collection.createIndex({ isAccepted: 1 });

    // Notification indexes
    await Notification.collection.createIndex({ recipient: 1 });
    await Notification.collection.createIndex({ isRead: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });

    // Tag indexes
    await Tag.collection.createIndex({ name: 1 }, { unique: true });
    await Tag.collection.createIndex({ count: -1 });

    console.log('✅ Database indexes created');

    // Create default users
    console.log('👥 Creating default users...');

    // Master Admin
    const masterAdminPassword = await bcrypt.hash('master123', 12);
    const masterAdmin = await User.create({
      username: 'master_admin',
      email: 'master@stackit.com',
      password: masterAdminPassword,
      role: 'master',
      reputation: 1000,
      isBanned: false,
      questionsAsked: 0,
      answersGiven: 0,
      acceptedAnswers: 0
    });

    // Regular Admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@stackit.com',
      password: adminPassword,
      role: 'admin',
      reputation: 500,
      isBanned: false,
      questionsAsked: 0,
      answersGiven: 0,
      acceptedAnswers: 0
    });

    // Regular User
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await User.create({
      username: 'demo_user',
      email: 'user@stackit.com',
      password: userPassword,
      role: 'user',
      reputation: 100,
      isBanned: false,
      questionsAsked: 0,
      answersGiven: 0,
      acceptedAnswers: 0
    });

    console.log('✅ Default users created');

    // Create sample tags
    console.log('🏷️ Creating sample tags...');
    const sampleTags = [
      'javascript', 'react', 'nodejs', 'python', 'java', 'c++', 'html', 'css',
      'typescript', 'vue', 'angular', 'mongodb', 'mysql', 'postgresql', 'docker',
      'kubernetes', 'aws', 'azure', 'git', 'linux', 'windows', 'macos'
    ];

    for (const tagName of sampleTags) {
      await Tag.create({
        name: tagName,
        count: Math.floor(Math.random() * 50) + 1,
        description: `Questions about ${tagName}`
      });
    }

    console.log('✅ Sample tags created');

    // Create sample questions
    console.log('❓ Creating sample questions...');
    const sampleQuestions = [
      {
        title: 'How to implement authentication in React with JWT?',
        shortDescription: 'Looking for a complete guide on implementing JWT authentication in a React application.',
        content: `I'm building a React application and need to implement JWT authentication. 

I've been looking at various tutorials but they all seem to have different approaches. Some use localStorage, others use cookies, and some use both.

What's the best practice for:
1. Storing JWT tokens securely
2. Handling token refresh
3. Protecting routes
4. Managing user state

I'm using React Router for navigation and Axios for API calls. Any help would be greatly appreciated!`,
        tags: ['react', 'javascript', 'authentication', 'jwt'],
        author: user._id,
        views: Math.floor(Math.random() * 1000) + 100,
        answers: Math.floor(Math.random() * 10) + 1,
        votes: {
          upvotes: [],
          downvotes: []
        },
        isAccepted: false
      },
      {
        title: 'Best practices for MongoDB schema design',
        shortDescription: 'What are the current best practices for designing MongoDB schemas for scalable applications?',
        content: `I'm designing a new application and want to use MongoDB as the database. 

I've read about embedding vs referencing, but I'm still confused about when to use each approach. 

My application will have:
- Users with profiles
- Posts with comments
- Categories and tags
- User relationships (followers/following)

What's the recommended schema design for this type of application? Should I embed comments in posts or keep them separate? How should I handle user relationships?

Any examples or resources would be helpful!`,
        tags: ['mongodb', 'database', 'schema-design'],
        author: admin._id,
        views: Math.floor(Math.random() * 1000) + 100,
        answers: Math.floor(Math.random() * 10) + 1,
        votes: {
          upvotes: [],
          downvotes: []
        },
        isAccepted: false
      },
      {
        title: 'Docker vs Kubernetes: When to use which?',
        shortDescription: 'Understanding the differences between Docker and Kubernetes and when to use each technology.',
        content: `I'm trying to understand the difference between Docker and Kubernetes and when to use each one.

From what I understand:
- Docker is for containerization
- Kubernetes is for orchestration

But I'm not sure when I need Kubernetes vs when Docker Compose is sufficient.

My current setup:
- Single server deployment
- 3-4 microservices
- PostgreSQL database
- Redis for caching

Should I stick with Docker Compose or move to Kubernetes? What are the trade-offs?`,
        tags: ['docker', 'kubernetes', 'devops', 'containers'],
        author: user._id,
        views: Math.floor(Math.random() * 1000) + 100,
        answers: Math.floor(Math.random() * 10) + 1,
        votes: {
          upvotes: [],
          downvotes: []
        },
        isAccepted: false
      }
    ];

    const createdQuestions = [];
    for (const questionData of sampleQuestions) {
      const question = await Question.create(questionData);
      createdQuestions.push(question);
    }

    console.log('✅ Sample questions created');

    // Create sample answers
    console.log('💬 Creating sample answers...');
    const sampleAnswers = [
      {
        content: `Great question! Here's a comprehensive approach to JWT authentication in React:

## 1. Token Storage
Use **httpOnly cookies** for security instead of localStorage:
\`\`\`javascript
// Set cookie on login
document.cookie = \`jwt=\${token}; httpOnly; secure; sameSite=strict\`;
\`\`\`

## 2. Token Refresh
Implement automatic token refresh:
\`\`\`javascript
const refreshToken = async () => {
  try {
    const response = await axios.post('/api/auth/refresh');
    return response.data.token;
  } catch (error) {
    // Redirect to login
    logout();
  }
};
\`\`\`

## 3. Route Protection
Create a ProtectedRoute component:
\`\`\`javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
\`\`\`

## 4. User State Management
Use Context API or Redux for global state management.

This approach provides better security and user experience.`,
        question: createdQuestions[0]._id,
        author: admin._id,
        votes: {
          upvotes: [user._id],
          downvotes: []
        },
        isAccepted: false
      },
      {
        content: `For MongoDB schema design, here are the key principles:

## Embedding vs Referencing

**Use Embedding when:**
- Data is small (< 16MB)
- Data is frequently accessed together
- Data doesn't change often

**Use Referencing when:**
- Data is large
- Data is accessed independently
- Data changes frequently

## Your Use Case

For your application:

1. **Users**: Keep profiles embedded in user documents
2. **Posts**: Embed comments if they're small and accessed together
3. **Categories/Tags**: Use referencing for flexibility
4. **Relationships**: Use separate collection with references

Example schema:
\`\`\`javascript
// Users
{
  _id: ObjectId,
  username: String,
  email: String,
  profile: {
    bio: String,
    avatar: String
  },
  followers: [ObjectId], // References to other users
  following: [ObjectId]
}

// Posts
{
  _id: ObjectId,
  author: ObjectId, // Reference to user
  title: String,
  content: String,
  comments: [{
    author: ObjectId,
    content: String,
    createdAt: Date
  }],
  tags: [ObjectId] // References to tags
}
\`\`\``,
        question: createdQuestions[1]._id,
        author: masterAdmin._id,
        votes: {
          upvotes: [user._id, admin._id],
          downvotes: []
        },
        isAccepted: true
      }
    ];

    for (const answerData of sampleAnswers) {
      await Answer.create(answerData);
    }

    console.log('✅ Sample answers created');

    // Update question with accepted answer
    await Question.findByIdAndUpdate(createdQuestions[1]._id, {
      isAccepted: true,
      acceptedAnswer: sampleAnswers[1].question
    });

    // Create sample notifications
    console.log('🔔 Creating sample notifications...');
    const sampleNotifications = [
      {
        recipient: user._id,
        sender: admin._id,
        type: 'answer',
        title: 'New answer to your question',
        message: 'admin answered your question about JWT authentication in React.',
        relatedQuestion: createdQuestions[0]._id,
        isRead: false
      },
      {
        recipient: user._id,
        sender: masterAdmin._id,
        type: 'accept',
        title: 'Your answer was accepted!',
        message: 'Your answer about MongoDB schema design was accepted by the question author.',
        relatedQuestion: createdQuestions[1]._id,
        isRead: false
      }
    ];

    for (const notificationData of sampleNotifications) {
      await Notification.create(notificationData);
    }

    console.log('✅ Sample notifications created');

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      questionsAsked: 2,
      answersGiven: 0
    });

    await User.findByIdAndUpdate(admin._id, {
      questionsAsked: 1,
      answersGiven: 1
    });

    await User.findByIdAndUpdate(masterAdmin._id, {
      questionsAsked: 0,
      answersGiven: 1,
      acceptedAnswers: 1
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Default Accounts:');
    console.log('Master Admin: master@stackit.com / master123');
    console.log('Admin: admin@stackit.com / admin123');
    console.log('User: user@stackit.com / user123');
    console.log('\n📊 Created:');
    console.log(`- ${sampleTags.length} tags`);
    console.log(`- ${sampleQuestions.length} questions`);
    console.log(`- ${sampleAnswers.length} answers`);
    console.log(`- ${sampleNotifications.length} notifications`);

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupDatabase(); 