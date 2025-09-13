/**
 * Database Reset and Recreation Script
 * 
 * This script will:
 * 1. Drop all existing collections
 * 2. Recreate the database with proper schema
 * 3. Add sample data with correct anonymous user support
 * 4. Ensure all relationships work properly
 */

import 'dotenv/config';
import mongoose from 'mongoose';

// Import all models to ensure they're registered
import User from '../models/User';
import Question from '../models/Question';
import Answer from '../models/Answer';
import Tag from '../models/Tag';
import Notification from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qa-forum';

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all collections
    console.log('🗑️  Dropping all existing collections...');
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`   Dropped: ${collection.name}`);
    }

    console.log('✅ All collections dropped');

    // Recreate indexes
    console.log('🔧 Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ phoneNumber: 1 }, { sparse: true });

    // Question indexes
    await Question.collection.createIndex({ title: 'text', content: 'text', tags: 'text' });
    await Question.collection.createIndex({ author: 1 });
    await Question.collection.createIndex({ realAuthor: 1 });
    await Question.collection.createIndex({ createdAt: -1 });
    await Question.collection.createIndex({ tags: 1 });

    // Answer indexes
    await Answer.collection.createIndex({ question: 1 });
    await Answer.collection.createIndex({ author: 1 });
    await Answer.collection.createIndex({ realAuthor: 1 });
    await Answer.collection.createIndex({ createdAt: -1 });

    // Tag indexes
    await Tag.collection.createIndex({ name: 1 }, { unique: true });

    // Notification indexes
    await Notification.collection.createIndex({ recipient: 1, createdAt: -1 });

    console.log('✅ Indexes created');

    // Create sample data
    console.log('📝 Creating sample data...');
    await createSampleData();

    console.log('🎉 Database reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createSampleData() {
  // Create tags first
  const tags = [
    { name: 'javascript', description: 'JavaScript programming language', color: '#f7df1e' },
    { name: 'typescript', description: 'TypeScript programming language', color: '#3178c6' },
    { name: 'react', description: 'React.js library', color: '#61dafb' },
    { name: 'nodejs', description: 'Node.js runtime', color: '#339933' },
    { name: 'nextjs', description: 'Next.js framework', color: '#000000' },
    { name: 'mongodb', description: 'MongoDB database', color: '#47a248' },
    { name: 'python', description: 'Python programming language', color: '#3776ab' },
    { name: 'css', description: 'Cascading Style Sheets', color: '#1572b6' },
    { name: 'html', description: 'HyperText Markup Language', color: '#e34f26' },
    { name: 'api', description: 'Application Programming Interface', color: '#ff6c37' },
    { name: 'database', description: 'Database related topics', color: '#336791' },
    { name: 'frontend', description: 'Frontend development', color: '#61dafb' },
    { name: 'backend', description: 'Backend development', color: '#339933' },
    { name: 'web-development', description: 'General web development', color: '#e44d26' },
    { name: 'authentication', description: 'User authentication and security', color: '#ff5722' }
  ];

  console.log('   Creating tags...');
  const createdTags = await Tag.insertMany(tags);
  console.log(`   ✅ Created ${createdTags.length} tags`);

  // Create users with proper authentication data
  const users = [
    {
      username: 'master_admin',
      email: 'master@stackit.com',
      password: 'password123', // Will be hashed by the model
      role: 'master',
      reputation: 2000,
      displayName: 'Master Admin',
      bio: 'System administrator with full access',
      location: 'San Francisco, CA',
      github: 'https://github.com/masteradmin',
      linkedin: 'https://linkedin.com/in/masteradmin',
      twitter: 'https://twitter.com/masteradmin',
      phoneCountry: '+1',
      phoneNumber: '1234567890',
      questionsAsked: 5,
      answersGiven: 15,
      acceptedAnswers: 12,
      isBanned: false
    },
    {
      username: 'john_developer',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      reputation: 850,
      displayName: 'John Developer',
      bio: 'Full-stack developer with 5 years of experience in React and Node.js',
      location: 'New York, NY',
      github: 'https://github.com/johndev',
      phoneCountry: '+1',
      phoneNumber: '2345678901',
      questionsAsked: 12,
      answersGiven: 28,
      acceptedAnswers: 5
    },
    {
      username: 'sarah_designer',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'user',
      reputation: 650,
      displayName: 'Sarah Designer',
      bio: 'UI/UX designer passionate about creating beautiful user experiences',
      location: 'Los Angeles, CA',
      website: 'https://sarahdesign.com',
      phoneCountry: '+1',
      phoneNumber: '3456789012',
      questionsAsked: 8,
      answersGiven: 15,
      acceptedAnswers: 3
    },
    {
      username: 'mike_backend',
      email: 'mike@example.com',
      password: 'password123',
      role: 'user',
      reputation: 720,
      displayName: 'Mike Backend',
      bio: 'Backend specialist with expertise in databases and APIs',
      location: 'Chicago, IL',
      github: 'https://github.com/mikebackend',
      phoneCountry: '+1',
      phoneNumber: '4567890123',
      questionsAsked: 6,
      answersGiven: 22,
      acceptedAnswers: 8
    },
    {
      username: 'lisa_python',
      email: 'lisa@example.com',
      password: 'password123',
      role: 'user',
      reputation: 950,
      displayName: 'Lisa Python',
      bio: 'Python enthusiast and data science practitioner',
      location: 'Seattle, WA',
      github: 'https://github.com/lisapython',
      phoneCountry: '+1',
      phoneNumber: '5678901234',
      questionsAsked: 10,
      answersGiven: 35,
      acceptedAnswers: 12
    },
    {
      username: 'test_user',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      reputation: 100,
      displayName: 'Test User',
      bio: 'Test user for development purposes',
      location: 'Test City',
      phoneCountry: '+1',
      phoneNumber: '9876543210',
      questionsAsked: 2,
      answersGiven: 3,
      acceptedAnswers: 1
    }
  ];

  console.log('   Creating users...');
  const createdUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save(); // This will trigger password hashing
    createdUsers.push(user);
  }
  console.log(`   ✅ Created ${createdUsers.length} users`);

  // Create questions with both regular and anonymous examples
  const questions = [
    {
      title: 'How to implement authentication in Next.js 14?',
      content: 'I\'m building a new application with Next.js 14 and need to implement user authentication. What are the best practices and recommended libraries for handling authentication, session management, and protecting routes?',
      shortDescription: 'Looking for Next.js 14 authentication implementation guidance',
      author: createdUsers[0]._id,
      realAuthor: createdUsers[0]._id,
      anonymous: false,
      tags: ['nextjs', 'authentication', 'javascript'],
      votes: { upvotes: [createdUsers[1]._id, createdUsers[2]._id], downvotes: [] },
      views: 125,
      answers: 0,
      isAccepted: false
    },
    {
      title: 'Best practices for MongoDB schema design?',
      content: 'I\'m designing a new MongoDB database for a social media application. What are the best practices for schema design, especially regarding relationships between users, posts, and comments?',
      shortDescription: 'MongoDB schema design best practices needed',
      author: null, // Anonymous question
      realAuthor: createdUsers[1]._id,
      anonymous: true,
      anonymousName: 'Anonymous7382',
      tags: ['mongodb', 'database', 'backend'],
      votes: { upvotes: [createdUsers[0]._id], downvotes: [] },
      views: 89,
      answers: 0,
      isAccepted: false
    },
    {
      title: 'React state management: Context vs Redux vs Zustand?',
      content: 'I\'m working on a medium-sized React application and trying to decide between Context API, Redux Toolkit, and Zustand for state management. What are the pros and cons of each approach?',
      shortDescription: 'Comparing React state management solutions',
      author: createdUsers[2]._id,
      realAuthor: createdUsers[2]._id,
      anonymous: false,
      tags: ['react', 'javascript', 'frontend'],
      votes: { upvotes: [createdUsers[0]._id, createdUsers[3]._id, createdUsers[4]._id], downvotes: [] },
      views: 234,
      answers: 0,
      isAccepted: false
    },
    {
      title: 'TypeScript generic constraints explained?',
      content: 'Can someone explain TypeScript generic constraints with practical examples? I\'m having trouble understanding when and how to use them effectively in my code.',
      shortDescription: 'Need help understanding TypeScript generic constraints',
      author: null, // Anonymous question
      realAuthor: createdUsers[3]._id,
      anonymous: true,
      anonymousName: 'Anonymous1547',
      tags: ['typescript', 'javascript'],
      votes: { upvotes: [createdUsers[1]._id], downvotes: [] },
      views: 67,
      answers: 0,
      isAccepted: false
    },
    {
      title: 'Python async/await vs threading performance?',
      content: 'I\'m building a web scraper and wondering about the performance differences between using async/await and threading in Python. Which approach is better for I/O-bound operations?',
      shortDescription: 'Python async vs threading performance comparison',
      author: createdUsers[4]._id,
      realAuthor: createdUsers[4]._id,
      anonymous: false,
      tags: ['python', 'backend'],
      votes: { upvotes: [createdUsers[0]._id, createdUsers[2]._id], downvotes: [] },
      views: 156,
      answers: 0,
      isAccepted: false
    }
  ];

  console.log('   Creating questions...');
  const createdQuestions = await Question.insertMany(questions);
  console.log(`   ✅ Created ${createdQuestions.length} questions`);

  // Create answers with both regular and anonymous examples
  const answers = [
    {
      content: 'For Next.js 14 authentication, I highly recommend using NextAuth.js (now Auth.js). It provides excellent support for multiple providers, JWT tokens, and session management. Here\'s a basic setup...',
      author: createdUsers[1]._id,
      realAuthor: createdUsers[1]._id,
      anonymous: false,
      question: createdQuestions[0]._id,
      votes: { upvotes: [createdUsers[0]._id, createdUsers[2]._id], downvotes: [] },
      isAccepted: true
    },
    {
      content: 'Another great option is to use Clerk or Auth0 for a managed authentication solution. They handle all the complexity for you and provide great developer experience.',
      author: null, // Anonymous answer
      realAuthor: createdUsers[2]._id,
      anonymous: true,
      anonymousName: 'Anonymous9284',
      question: createdQuestions[0]._id,
      votes: { upvotes: [createdUsers[1]._id], downvotes: [] },
      isAccepted: false
    },
    {
      content: 'For MongoDB schema design, consider these key principles:\n\n1. Embed related data that is frequently accessed together\n2. Reference data that is large or changes frequently\n3. Use compound indexes for queries that filter on multiple fields\n4. Consider data growth patterns when designing your schema',
      author: createdUsers[0]._id,
      realAuthor: createdUsers[0]._id,
      anonymous: false,
      question: createdQuestions[1]._id,
      votes: { upvotes: [createdUsers[1]._id, createdUsers[3]._id], downvotes: [] },
      isAccepted: true
    },
    {
      content: 'For React state management:\n\n**Context API**: Great for small to medium apps, built-in, no extra dependencies\n**Redux Toolkit**: Best for complex state logic, time-travel debugging, great DevTools\n**Zustand**: Lightweight, simple API, great TypeScript support\n\nChoose based on your app complexity and team preferences.',
      author: createdUsers[3]._id,
      realAuthor: createdUsers[3]._id,
      anonymous: false,
      question: createdQuestions[2]._id,
      votes: { upvotes: [createdUsers[0]._id, createdUsers[2]._id, createdUsers[4]._id], downvotes: [] },
      isAccepted: true
    },
    {
      content: 'TypeScript generic constraints allow you to limit the types that can be used with generics. Here\'s a practical example:\n\n```typescript\ninterface HasLength {\n  length: number;\n}\n\nfunction logLength<T extends HasLength>(arg: T): T {\n  console.log(arg.length);\n  return arg;\n}\n```\n\nThis ensures T must have a length property.',
      author: null, // Anonymous answer
      realAuthor: createdUsers[4]._id,
      anonymous: true,
      anonymousName: 'Anonymous4729',
      question: createdQuestions[3]._id,
      votes: { upvotes: [createdUsers[1]._id, createdUsers[3]._id], downvotes: [] },
      isAccepted: true
    },
    {
      content: 'For I/O-bound operations like web scraping, async/await is generally better than threading in Python:\n\n- Lower memory overhead\n- Better resource utilization\n- Easier to reason about\n- No GIL limitations for I/O\n\nUse aiohttp for HTTP requests and asyncio for coordination.',
      author: createdUsers[0]._id,
      realAuthor: createdUsers[0]._id,
      anonymous: false,
      question: createdQuestions[4]._id,
      votes: { upvotes: [createdUsers[2]._id, createdUsers[4]._id], downvotes: [] },
      isAccepted: true
    }
  ];

  console.log('   Creating answers...');
  const createdAnswers = await Answer.insertMany(answers);
  console.log(`   ✅ Created ${createdAnswers.length} answers`);

  // Update question answer counts and accepted status
  for (let i = 0; i < createdQuestions.length; i++) {
    const answerCount = createdAnswers.filter(answer => 
      answer.question.toString() === createdQuestions[i]._id.toString()
    ).length;
    
    const hasAcceptedAnswer = createdAnswers.some(answer => 
      answer.question.toString() === createdQuestions[i]._id.toString() && answer.isAccepted
    );

    await Question.findByIdAndUpdate(createdQuestions[i]._id, {
      answers: answerCount,
      isAccepted: hasAcceptedAnswer,
      acceptedAnswer: hasAcceptedAnswer ? createdAnswers.find(a => 
        a.question.toString() === createdQuestions[i]._id.toString() && a.isAccepted
      )?._id : undefined
    });
  }

  // Create some notifications
  const notifications = [
    {
      recipient: createdUsers[0]._id,
      sender: createdUsers[1]._id,
      type: 'answer',
      title: 'New Answer',
      message: 'john_developer answered your question about Next.js authentication',
      relatedQuestion: createdQuestions[0]._id,
      relatedAnswer: createdAnswers[0]._id,
      isRead: false
    },
    {
      recipient: createdUsers[1]._id,
      sender: createdUsers[0]._id,
      type: 'answer',
      title: 'New Answer',
      message: 'Someone answered your question anonymously about MongoDB schema design',
      relatedQuestion: createdQuestions[1]._id,
      relatedAnswer: createdAnswers[2]._id,
      isRead: false
    }
  ];

  console.log('   Creating notifications...');
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`   ✅ Created ${createdNotifications.length} notifications`);

  // Update user statistics
  for (const user of createdUsers) {
    const userQuestions = createdQuestions.filter(q => 
      q.realAuthor?.toString() === user._id.toString()
    );
    const userAnswers = createdAnswers.filter(a => 
      a.realAuthor?.toString() === user._id.toString()
    );
    const acceptedAnswers = userAnswers.filter(a => a.isAccepted);

    await User.findByIdAndUpdate(user._id, {
      questionsAsked: userQuestions.length,
      answersGiven: userAnswers.length,
      acceptedAnswers: acceptedAnswers.length
    });
  }

  console.log('   ✅ Updated user statistics');
}

// Run the reset
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('🚀 Database reset completed successfully!');
      console.log('\n📊 Summary:');
      console.log('   - 6 users created (including master_admin)');
      console.log('   - 15 tags created');
      console.log('   - 5 questions created (2 anonymous, 3 regular)');
      console.log('   - 6 answers created (2 anonymous, 4 regular)');
      console.log('   - 2 notifications created');
      console.log('   - All indexes and relationships properly set up');
      console.log('\n🔐 Test Credentials:');
      console.log('   Username: master_admin');
      console.log('   Password: password123');
      console.log('\n✨ The database is now ready for use!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to reset database:', error);
      process.exit(1);
    });
}

export default resetDatabase;
