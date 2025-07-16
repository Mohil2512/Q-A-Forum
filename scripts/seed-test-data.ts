/**
 * Database Seeding Script
 * 
 * This script populates the database with test data for development and testing purposes.
 * Run with: npx tsx scripts/seed-test-data.ts
 * 
 * Creates:
 * - 8 test users (including 1 master admin)
 * - 15 tags
 * - 27 questions with realistic content
 * - 43 answers (10 accepted)
 * - 10 notifications
 */

import mongoose from 'mongoose';
import User from '../models/User';
import Question from '../models/Question';
import Answer from '../models/Answer';
import Tag from '../models/Tag';
import Notification from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qa-forum';

// Sample data
const testUsers = [
  {
    username: 'master_admin',
    email: 'master@stackit.com',
    password: 'password123',
    role: 'master' as const,
    reputation: 1000,
    displayName: 'Master Admin',
    bio: 'System administrator',
    location: 'San Francisco, CA',
    github: 'https://github.com/masteradmin',
    linkedin: 'https://linkedin.com/in/masteradmin',
    twitter: 'https://twitter.com/masteradmin'
  },
  {
    username: 'john_developer',
    email: 'john@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 850,
    displayName: 'John Developer',
    bio: 'Full-stack developer with 5 years of experience',
    location: 'New York, NY',
    github: 'https://github.com/johndev',
    questionsAsked: 8,
    answersGiven: 15,
    acceptedAnswers: 3
  },
  {
    username: 'sarah_designer',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 720,
    displayName: 'Sarah Designer',
    bio: 'UI/UX designer passionate about user experience',
    location: 'Los Angeles, CA',
    linkedin: 'https://linkedin.com/in/sarahdesigner',
    questionsAsked: 5,
    answersGiven: 12,
    acceptedAnswers: 2
  },
  {
    username: 'mike_devops',
    email: 'mike@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 650,
    displayName: 'Mike DevOps',
    bio: 'DevOps engineer specializing in cloud infrastructure',
    location: 'Austin, TX',
    github: 'https://github.com/mikedevops',
    questionsAsked: 6,
    answersGiven: 18,
    acceptedAnswers: 4
  },
  {
    username: 'emma_frontend',
    email: 'emma@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 580,
    displayName: 'Emma Frontend',
    bio: 'Frontend developer focused on React and TypeScript',
    location: 'Seattle, WA',
    github: 'https://github.com/emmafrontend',
    questionsAsked: 4,
    answersGiven: 10,
    acceptedAnswers: 1
  },
  {
    username: 'alex_backend',
    email: 'alex@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 920,
    displayName: 'Alex Backend',
    bio: 'Backend developer with expertise in Node.js and Python',
    location: 'Boston, MA',
    linkedin: 'https://linkedin.com/in/alexbackend',
    questionsAsked: 7,
    answersGiven: 22,
    acceptedAnswers: 5
  },
  {
    username: 'lisa_qa',
    email: 'lisa@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 450,
    displayName: 'Lisa QA',
    bio: 'QA engineer ensuring software quality',
    location: 'Chicago, IL',
    questionsAsked: 3,
    answersGiven: 8,
    acceptedAnswers: 0
  },
  {
    username: 'david_architect',
    email: 'david@example.com',
    password: 'password123',
    role: 'user' as const,
    reputation: 1100,
    displayName: 'David Architect',
    bio: 'Software architect with 10+ years of experience',
    location: 'Denver, CO',
    github: 'https://github.com/davidarchitect',
    linkedin: 'https://linkedin.com/in/davidarchitect',
    questionsAsked: 10,
    answersGiven: 25,
    acceptedAnswers: 8
  }
];

const testTags = [
  { name: 'javascript', description: 'JavaScript programming language' },
  { name: 'react', description: 'React.js library for building user interfaces' },
  { name: 'nodejs', description: 'Node.js runtime environment' },
  { name: 'python', description: 'Python programming language' },
  { name: 'mongodb', description: 'MongoDB NoSQL database' },
  { name: 'docker', description: 'Docker containerization platform' },
  { name: 'aws', description: 'Amazon Web Services cloud platform' },
  { name: 'typescript', description: 'TypeScript programming language' },
  { name: 'nextjs', description: 'Next.js React framework' },
  { name: 'css', description: 'Cascading Style Sheets' },
  { name: 'html', description: 'HyperText Markup Language' },
  { name: 'git', description: 'Git version control system' },
  { name: 'api', description: 'Application Programming Interface' },
  { name: 'database', description: 'Database systems and design' },
  { name: 'testing', description: 'Software testing methodologies' }
];

const testQuestions = [
  {
    title: 'How to implement authentication in Next.js with NextAuth?',
    content: 'I\'m building a Next.js application and want to implement user authentication using NextAuth. Can someone provide a step-by-step guide on how to set up NextAuth with Google and GitHub providers? I\'m particularly interested in the configuration and callback handling.',
    shortDescription: 'Step-by-step guide for implementing NextAuth authentication with Google and GitHub providers in Next.js applications.',
    tags: ['nextjs', 'authentication', 'nextauth'],
    author: null as any, // Will be set after user creation
    views: 245,
    votes: 12
  },
  {
    title: 'Best practices for MongoDB schema design',
    content: 'I\'m designing a MongoDB schema for an e-commerce application. What are the best practices for structuring documents? Should I embed or reference related data? Looking for examples and trade-offs.',
    shortDescription: 'Guidelines and examples for designing efficient MongoDB schemas for e-commerce applications.',
    tags: ['mongodb', 'database', 'schema-design'],
    author: null as any,
    views: 189,
    votes: 8
  },
  {
    title: 'React hooks vs class components: when to use which?',
    content: 'I\'m learning React and confused about when to use hooks vs class components. Can someone explain the differences and provide guidance on when to choose one over the other?',
    shortDescription: 'Comparison between React hooks and class components with guidance on when to use each approach.',
    tags: ['react', 'javascript', 'hooks'],
    author: null as any,
    views: 567,
    votes: 23
  },
  {
    title: 'Docker container optimization techniques',
    content: 'I\'m working on optimizing Docker containers for production deployment. What are the best practices for reducing image size and improving performance? Looking for specific techniques and examples.',
    shortDescription: 'Best practices and techniques for optimizing Docker containers for production deployment.',
    tags: ['docker', 'devops', 'optimization'],
    author: null as any,
    views: 134,
    votes: 6
  },
  {
    title: 'TypeScript strict mode configuration',
    content: 'I want to enable strict mode in TypeScript but getting many errors. How should I configure tsconfig.json for strict mode? What are the benefits and how to handle common issues?',
    shortDescription: 'Guide to configuring TypeScript strict mode and handling common configuration issues.',
    tags: ['typescript', 'configuration', 'strict-mode'],
    author: null as any,
    views: 298,
    votes: 15
  },
  {
    title: 'AWS Lambda function deployment best practices',
    content: 'I\'m deploying Lambda functions to AWS and want to follow best practices. What are the recommended approaches for packaging, environment variables, and monitoring?',
    shortDescription: 'Best practices for deploying and managing AWS Lambda functions in production.',
    tags: ['aws', 'lambda', 'serverless'],
    author: null as any,
    views: 176,
    votes: 9
  },
  {
    title: 'Git workflow for team collaboration',
    content: 'Our team is growing and we need to establish a proper Git workflow. What branching strategy should we use? How to handle code reviews and deployments?',
    shortDescription: 'Establishing effective Git workflows for team collaboration and code management.',
    tags: ['git', 'workflow', 'collaboration'],
    author: null as any,
    views: 423,
    votes: 18
  },
  {
    title: 'API rate limiting implementation',
    content: 'I need to implement rate limiting for my REST API. What are the different approaches? Should I use Redis, in-memory storage, or database? Looking for Node.js examples.',
    shortDescription: 'Different approaches to implementing API rate limiting with Node.js examples.',
    tags: ['api', 'rate-limiting', 'nodejs'],
    author: null as any,
    views: 234,
    votes: 11
  },
  {
    title: 'CSS Grid vs Flexbox: when to use which?',
    content: 'I\'m confused about when to use CSS Grid vs Flexbox for layout. Can someone explain the differences and provide examples of when each is more appropriate?',
    shortDescription: 'Understanding when to use CSS Grid vs Flexbox for different layout scenarios.',
    tags: ['css', 'layout', 'grid', 'flexbox'],
    author: null as any,
    views: 345,
    votes: 16
  },
  {
    title: 'Testing React components with Jest and React Testing Library',
    content: 'I\'m setting up testing for my React components. How should I structure tests with Jest and React Testing Library? What are the best practices for testing user interactions?',
    shortDescription: 'Best practices for testing React components using Jest and React Testing Library.',
    tags: ['react', 'testing', 'jest'],
    author: null as any,
    views: 267,
    votes: 13
  },
  {
    title: 'Python virtual environments and dependency management',
    content: 'I\'m new to Python development. How do virtual environments work? What\'s the difference between pip, pipenv, and poetry? Which should I use for my project?',
    shortDescription: 'Understanding Python virtual environments and choosing the right dependency management tool.',
    tags: ['python', 'virtual-environments', 'dependency-management'],
    author: null as any,
    views: 198,
    votes: 7
  },
  {
    title: 'MongoDB aggregation pipeline examples',
    content: 'I need to perform complex queries on my MongoDB data. Can someone provide examples of aggregation pipelines for common use cases like grouping, filtering, and data transformation?',
    shortDescription: 'Examples of MongoDB aggregation pipelines for complex data queries and transformations.',
    tags: ['mongodb', 'aggregation', 'database'],
    author: null as any,
    views: 156,
    votes: 5
  },
  {
    title: 'Next.js API routes vs external API',
    content: 'I\'m building a Next.js app and wondering whether to use API routes or call external APIs directly. What are the pros and cons of each approach?',
    shortDescription: 'Comparing Next.js API routes with external API calls for different use cases.',
    tags: ['nextjs', 'api', 'architecture'],
    author: null as any,
    views: 189,
    votes: 8
  },
  {
    title: 'JavaScript async/await error handling',
    content: 'I\'m using async/await in JavaScript but having trouble with error handling. How should I structure try-catch blocks? What are the best practices for handling errors in async functions?',
    shortDescription: 'Best practices for error handling in JavaScript async/await functions.',
    tags: ['javascript', 'async-await', 'error-handling'],
    author: null as any,
    views: 312,
    votes: 14
  },
  {
    title: 'Docker Compose for development environment',
    content: 'I want to set up a development environment using Docker Compose. How should I structure the docker-compose.yml file? What services should I include for a typical web application?',
    shortDescription: 'Setting up development environments using Docker Compose for web applications.',
    tags: ['docker', 'docker-compose', 'development'],
    author: null as any,
    views: 145,
    votes: 6
  },
  {
    title: 'AWS S3 file upload with presigned URLs',
    content: 'I need to implement file upload to AWS S3 using presigned URLs. How do I generate presigned URLs on the backend? What\'s the security best practices?',
    shortDescription: 'Implementing secure file uploads to AWS S3 using presigned URLs.',
    tags: ['aws', 's3', 'file-upload'],
    author: null as any,
    views: 178,
    votes: 9
  },
  {
    title: 'React state management with Context API',
    content: 'I\'m using React Context API for state management. How should I structure my context providers? When should I use Context vs Redux or other state management libraries?',
    shortDescription: 'Structuring React Context API for state management and when to use it vs other solutions.',
    tags: ['react', 'context-api', 'state-management'],
    author: null as any,
    views: 234,
    votes: 12
  },
  {
    title: 'TypeScript interface vs type alias',
    content: 'I\'m learning TypeScript and confused about interfaces vs type aliases. When should I use each? What are the differences in terms of extensibility and performance?',
    shortDescription: 'Understanding the differences between TypeScript interfaces and type aliases.',
    tags: ['typescript', 'interfaces', 'type-aliases'],
    author: null as any,
    views: 267,
    votes: 11
  },
  {
    title: 'MongoDB indexing strategies',
    content: 'My MongoDB queries are slow. How should I design indexes for optimal performance? What are the different types of indexes and when to use them?',
    shortDescription: 'Designing effective MongoDB indexes for optimal query performance.',
    tags: ['mongodb', 'indexing', 'performance'],
    author: null as any,
    views: 198,
    votes: 8
  },
  {
    title: 'Git hooks for code quality',
    content: 'I want to set up Git hooks to ensure code quality. How can I use pre-commit hooks for linting and testing? What tools should I integrate?',
    shortDescription: 'Setting up Git hooks for automated code quality checks and testing.',
    tags: ['git', 'hooks', 'code-quality'],
    author: null as any,
    views: 156,
    votes: 7
  },
  {
    title: 'Node.js performance optimization',
    content: 'My Node.js application is experiencing performance issues. What are the common bottlenecks and how to optimize them? Should I use clustering, caching, or other techniques?',
    shortDescription: 'Identifying and resolving performance bottlenecks in Node.js applications.',
    tags: ['nodejs', 'performance', 'optimization'],
    author: null as any,
    views: 223,
    votes: 10
  },
  {
    title: 'CSS-in-JS vs traditional CSS',
    content: 'I\'m debating between CSS-in-JS libraries and traditional CSS. What are the pros and cons of each approach? Which is better for maintainability and performance?',
    shortDescription: 'Comparing CSS-in-JS libraries with traditional CSS for maintainability and performance.',
    tags: ['css', 'css-in-js', 'styling'],
    author: null as any,
    views: 189,
    votes: 9
  },
  {
    title: 'API documentation with OpenAPI/Swagger',
    content: 'I need to document my REST API. How should I set up OpenAPI/Swagger documentation? What are the best practices for maintaining API documentation?',
    shortDescription: 'Setting up and maintaining OpenAPI/Swagger documentation for REST APIs.',
    tags: ['api', 'documentation', 'openapi'],
    author: null as any,
    views: 145,
    votes: 6
  },
  {
    title: 'React component composition patterns',
    content: 'I want to improve my React component architecture. What are the best patterns for component composition? How should I structure reusable components?',
    shortDescription: 'Best patterns for React component composition and reusable component architecture.',
    tags: ['react', 'components', 'architecture'],
    author: null as any,
    views: 234,
    votes: 12
  },
  {
    title: 'MongoDB backup and recovery strategies',
    content: 'I need to implement backup and recovery for my MongoDB database. What are the recommended strategies? How often should I backup and how to test recovery?',
    shortDescription: 'Implementing effective backup and recovery strategies for MongoDB databases.',
    tags: ['mongodb', 'backup', 'recovery'],
    author: null as any,
    views: 167,
    votes: 7
  },
  {
    title: 'AWS CloudFormation vs Terraform',
    content: 'I\'m choosing between AWS CloudFormation and Terraform for infrastructure as code. What are the differences? Which is better for AWS-specific resources vs multi-cloud?',
    shortDescription: 'Comparing AWS CloudFormation and Terraform for infrastructure as code.',
    tags: ['aws', 'terraform', 'infrastructure'],
    author: null as any,
    views: 198,
    votes: 9
  },
  {
    title: 'JavaScript module bundling with Webpack',
    content: 'I\'m configuring Webpack for my JavaScript project. How should I set up loaders and plugins? What are the optimization techniques for production builds?',
    shortDescription: 'Configuring Webpack for JavaScript projects with optimization techniques.',
    tags: ['javascript', 'webpack', 'bundling'],
    author: null as any,
    views: 178,
    votes: 8
  }
];

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Tag.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create tags
    const createdTags = await Tag.insertMany(testTags);
    console.log(`Created ${createdTags.length} tags`);

    // Create users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create questions with proper author references
    const questionsWithAuthors = testQuestions.map((q, index) => ({
      ...q,
      author: createdUsers[index % createdUsers.length]._id,
      tags: q.tags.map(tagName => {
        const tag = createdTags.find(t => t.name === tagName);
        return tag ? tag._id : null;
      }).filter(Boolean)
    }));

    const createdQuestions = await Question.insertMany(questionsWithAuthors);
    console.log(`Created ${createdQuestions.length} questions`);

    // Create answers
    const answers = [];
    let acceptedCount = 0;

    for (let i = 0; i < createdQuestions.length; i++) {
      const question = createdQuestions[i];
      const questionAuthor = createdUsers.find(u => u._id.equals(question.author));
      
      // Create 1-3 answers per question
      const numAnswers = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numAnswers; j++) {
        const answerAuthor = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        // Don't let users answer their own questions
        if (answerAuthor._id.equals(question.author)) continue;
        
        const isAccepted = acceptedCount < 10 && j === 0 && Math.random() > 0.5;
        if (isAccepted) acceptedCount++;
        
        answers.push({
          content: `This is answer ${j + 1} for question "${question.title}". Here's a detailed explanation with code examples and best practices.`,
          author: answerAuthor._id,
          question: question._id,
          isAccepted,
          votes: Math.floor(Math.random() * 10)
        });
      }
    }

    const createdAnswers = await Answer.insertMany(answers);
    console.log(`Created ${createdAnswers.length} answers with ${acceptedCount} accepted`);

    // Update question answer counts
    for (const question of createdQuestions) {
      const answerCount = createdAnswers.filter(a => a.question.equals(question._id)).length;
      await Question.findByIdAndUpdate(question._id, { answers: answerCount });
    }

    // Update user stats
    for (const user of createdUsers) {
      const userQuestions = createdQuestions.filter(q => q.author.equals(user._id)).length;
      const userAnswers = createdAnswers.filter(a => a.author.equals(user._id)).length;
      const userAcceptedAnswers = createdAnswers.filter(a => a.author.equals(user._id) && a.isAccepted).length;
      
      await User.findByIdAndUpdate(user._id, {
        questionsAsked: userQuestions,
        answersGiven: userAnswers,
        acceptedAnswers: userAcceptedAnswers
      });
    }

    // Create some notifications
    const notifications = [];
    for (const answer of createdAnswers.slice(0, 10)) {
      const question = createdQuestions.find(q => q._id.equals(answer.question));
      if (question && !answer.author.equals(question.author)) {
        notifications.push({
          recipient: question.author,
          sender: answer.author,
          type: 'answer' as const,
          title: 'New answer to your question',
          message: `${createdUsers.find(u => u._id.equals(answer.author))?.username} answered your question "${question.title}"`,
          relatedQuestion: question._id,
          relatedAnswer: answer._id
        });
      }
    }

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications`);

    console.log('Seed data created successfully!');
    console.log(`Summary: ${createdUsers.length} users, ${createdQuestions.length} questions, ${createdAnswers.length} answers, ${acceptedCount} accepted answers`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedData(); 