# StackIt - QA Forum Platform

[![Try it live](https://img.shields.io/badge/Try%20it%20Live-StackIt-blue?style=for-the-badge)](https://stack1t.vercel.app/)

A modern, feature-rich Q&A platform built with Next.js, featuring the InfinityFX UI theme with glassmorphism effects and a sophisticated color palette.

## 🎨 InfinityFX Theme

This application features a custom InfinityFX-inspired theme with:
- **Color Palette**: `#17153b`, `#2e236c`, `#433d8b`, `#c8acd6`
- **Glassmorphism Effects**: Backdrop blur and transparency
- **Modern Gradients**: Smooth color transitions
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Hover effects and transitions

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure sign-in/sign-up with NextAuth.js
- **Question Management**: Ask, edit, and manage questions
- **Answer System**: Provide and accept answers
- **Voting System**: Upvote/downvote questions and answers
- **Search & Filter**: Advanced search with real-time results
- **Tag System**: Organize content with tags
- **Notifications**: Real-time notification system
- **User Profiles**: Comprehensive user profiles with statistics

### Admin Panel
- **User Management**: Ban, suspend, and manage users
- **Content Moderation**: Review and manage questions/answers
- **Role-based Access**: Master admin and regular admin roles
- **Analytics Dashboard**: Platform statistics and insights

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks and server components
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth.js**: Authentication with multiple providers
- **MongoDB**: NoSQL database with Mongoose ODM
- **Pusher**: Real-time notifications and updates

### Additional Tools
- **Cloudinary**: Image upload and optimization
- **Nodemailer**: Email notifications
- **bcryptjs**: Password hashing
- **Sharp**: Image processing

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### 1. Clone and Install
```bash
git clone https://github.com/Mohil2512/Q-A-Forum.git
cd Q-A-Forum
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stackit
# Or use MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/stackit

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (optional - for notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@stackit.com

# Pusher (for real-time notifications)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Vercel Analytics (optional)
VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

### 3. Database Setup
Run the database seeding script to populate the database with sample data:

```bash
npm run seed
```

This will create:
- 8 test users (including 1 master admin)
- 15 tags
- 27 questions with realistic content
- 43 answers (10 accepted)
- 10 notifications

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 👥 Default Accounts

After running the database seeding script, you'll have these test accounts:

### Master Admin
- **Email**: `master@stackit.com`
- **Password**: `password123`
- **Role**: Master Admin (full access)

### Test Users
- **Email**: `john@example.com` / **Password**: `password123`
- **Email**: `sarah@example.com` / **Password**: `password123`
- **Email**: `mike@example.com` / **Password**: `password123`
- **Email**: `emma@example.com` / **Password**: `password123`
- **Email**: `alex@example.com` / **Password**: `password123`
- **Email**: `lisa@example.com` / **Password**: `password123`
- **Email**: `david@example.com` / **Password**: `password123`

## 🔧 Admin Panel Usage

### Accessing Admin Panel
1. Sign in with an admin account
2. Click on your profile menu in the header
3. Select "Admin Panel"

### User Management
- **View Users**: See all registered users with their roles and status
- **Ban Users**: Permanently ban users from the platform
- **Suspend Users**: Temporarily suspend users with custom duration
- **Unban/Unsuspend**: Restore user access

### Content Moderation
- **Questions**: Review and delete inappropriate questions
- **Answers**: Moderate answers and remove violations
- **View Content**: Click "View" to see the full content

### Admin Roles
- **Master Admin**: Full access to all features
- **Regular Admin**: Can manage users and content, but cannot manage other admins

## 🎯 Key Improvements Implemented

### UI/UX Enhancements
- ✅ **InfinityFX Theme**: Complete color palette and design system
- ✅ **Glassmorphism Effects**: Modern backdrop blur and transparency
- ✅ **Border Radius**: Rounded corners on buttons and cards
- ✅ **Gradient Effects**: Smooth color transitions throughout
- ✅ **Responsive Design**: Mobile-optimized interface

### Functional Improvements
- ✅ **Independent Vote Counters**: Separate upvote/downvote displays
- ✅ **Enhanced Search**: Debounced search with real-time results
- ✅ **Notification System**: Real-time notifications with proper counts
- ✅ **Answer Acceptance**: Fixed authentication for accepting answers
- ✅ **Admin Panel**: Complete database setup and management
- ✅ **Enhanced Tags System**: Comprehensive tag browsing and filtering

### Technical Fixes
- ✅ **Database Seeding**: Comprehensive test data script
- ✅ **API Endpoints**: All notification and admin APIs implemented
- ✅ **Authentication**: Proper session handling with OAuth support
- ✅ **Error Handling**: Improved error messages and validation
- ✅ **Security**: Input validation, XSS protection, and proper authorization

## 📁 Project Structure

```
Q-A-Forum/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── admin/         # Admin management APIs
│   │   ├── auth/          # Authentication APIs
│   │   ├── questions/     # Question management
│   │   ├── answers/       # Answer management
│   │   ├── notifications/ # Notification system
│   │   └── vote/          # Voting system
│   ├── auth/              # Authentication pages
│   ├── questions/         # Question-related pages
│   ├── profile/           # User profile pages
│   ├── admin-panel/       # Admin panel interface
│   └── globals.css        # Global styles with InfinityFX theme
├── components/            # Reusable React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── QuestionCard.tsx   # Question display component
│   ├── RichTextEditor.tsx # Rich text editing
│   └── NotificationDropdown.tsx
├── models/               # MongoDB Mongoose models
│   ├── User.ts           # User schema and model
│   ├── Question.ts       # Question schema
│   ├── Answer.ts         # Answer schema
│   ├── Tag.ts            # Tag schema
│   └── Notification.ts   # Notification schema
├── lib/                  # Utility functions and configurations
│   ├── mongodb.ts        # Database connection
│   ├── pusher.ts         # Real-time configuration
│   └── countryCodes.ts   # Country code utilities
├── scripts/              # Database setup and utilities
│   └── seed-test-data.ts # Database seeding script
├── types/                # TypeScript type definitions
│   └── next-auth.d.ts    # NextAuth type extensions
└── public/               # Static assets
    └── favicon.svg       # Site icon
```

## 🎨 Theme Customization

The InfinityFX theme is implemented through:

### Color Variables
```css
--primary-dark: #17153b
--primary-medium: #2e236c
--primary-light: #433d8b
--accent: #c8acd6
```

### CSS Classes
- `.card`: Glassmorphism card component
- `.btn-primary`: Primary button with gradients
- `.gradient-text`: Text with gradient effects
- `.glass`: Glassmorphism background
- `.glow`: Glow effects for interactive elements

## 🔒 Security Features

### Authentication & Authorization
- **NextAuth.js**: Secure authentication with multiple providers
- **JWT Tokens**: Stateless session management
- **Role-based Access**: User, Admin, and Master Admin roles
- **OAuth Support**: Google and GitHub authentication
- **Password Hashing**: bcrypt with salt rounds

### Input Validation & Sanitization
- **MongoDB Schema Validation**: Strict data validation
- **API Input Validation**: Request body validation
- **XSS Protection**: Rich text editor with safe HTML operations
- **File Upload Security**: Type and size validation
- **SQL Injection Prevention**: Mongoose ODM protection

### Data Protection
- **Environment Variables**: Sensitive data in .env files
- **CORS Protection**: Proper cross-origin handling
- **Rate Limiting**: Built-in Next.js protection
- **Secure Headers**: Next.js security headers

## 🚀 Deployment

### Vercel (Recommended)
1. Fork the repository to your GitHub account
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard:
   - Add all variables from your `.env.local` file
   - Update `NEXTAUTH_URL` to your production domain
4. Deploy automatically on push

### Manual Deployment Steps
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production
Make sure to set these in your hosting platform:
- `MONGODB_URI` - Production MongoDB connection string
- `NEXTAUTH_URL` - Your production domain URL
- `NEXTAUTH_SECRET` - Strong secret for production
- All Cloudinary, Pusher, and OAuth credentials

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Use Railway's MongoDB integration
- **DigitalOcean**: Deploy with App Platform
- **AWS**: Deploy with Amplify or EC2

## 📊 Database Schema

### Collections Overview
- **users**: User accounts with roles and authentication
- **questions**: Questions with tags, votes, and metadata
- **answers**: Answers linked to questions with acceptance status
- **tags**: Reusable tags for content organization
- **notifications**: Real-time notification system

## 🤝 Contributing

We welcome contributions to improve StackIt! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the project structure
4. Test your changes thoroughly
5. Commit with descriptive messages: `git commit -m "Add feature: description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request with a clear description

### Coding Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

### Areas for Contribution
- UI/UX improvements and new themes
- Additional authentication providers
- Enhanced admin features
- Performance optimizations
- Documentation improvements
- Bug fixes and security enhancements

## 📈 Performance Features

- **Image Optimization**: Next.js Image component with Cloudinary integration
- **Code Splitting**: Automatic code splitting with Next.js
- **Server Components**: React Server Components for better performance
- **Caching**: Smart caching strategies for API responses
- **Lazy Loading**: Components and images loaded on demand
- **Optimized Build**: Production-ready build with minification

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Seed database with test data
npm run seed

# Type checking
npx tsc --noEmit
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support & Documentation

### Getting Help
- **Issues**: [Create an issue](https://github.com/Mohil2512/Q-A-Forum/issues) for bugs or feature requests
- **Discussions**: Join community discussions for general questions
- **Documentation**: Review this README and inline code comments
- **Admin Guide**: Check the admin panel section above

### Common Issues
- **Database Connection**: Ensure MongoDB is running and URI is correct
- **Environment Variables**: Double-check all required variables are set
- **Build Errors**: Clear `.next` directory and rebuild
- **Permission Issues**: Run commands with appropriate permissions

### Version Information
- **Next.js**: 14.0.4+
- **React**: 18+
- **Node.js**: 18+ required
- **MongoDB**: 4.4+ recommended

---

**Built with ❤️ using Next.js, MongoDB, TypeScript, and the InfinityFX design system**

---

## 📝 Changelog

### Latest Updates (September 2025)
- ✅ **Enhanced Tags System**: Complete tag browsing with search and filtering
- ✅ **Tag Navigation**: Clickable tags throughout the application
- ✅ **Individual Question Tags**: Tags display in question detail pages
- ✅ **API Improvements**: Enhanced questions API with flexible tag filtering
- ✅ **Vercel Deployment Fixes**: Resolved SSR issues and empty file cleanup
- ✅ **Complete TypeScript migration**
- ✅ **Enhanced admin panel with user management**
- ✅ **Real-time notification system with Pusher**
- ✅ **Image upload optimization with Cloudinary**
- ✅ **Improved security with input validation**
- ✅ **Mobile-responsive InfinityFX theme**
- ✅ **Advanced search and filtering**
- ✅ **Email notification system**
- ✅ **OAuth integration (Google, GitHub)**
- ✅ **Comprehensive error handling**
