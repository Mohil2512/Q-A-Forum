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

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd QA_Forum
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stackit

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email (optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@stackit.com
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

### Technical Fixes
- ✅ **Database Seeding**: Comprehensive test data script
- ✅ **API Endpoints**: All notification and admin APIs implemented
- ✅ **Authentication**: Proper session handling with OAuth support
- ✅ **Error Handling**: Improved error messages and validation
- ✅ **Security**: Input validation, XSS protection, and proper authorization

## 📁 Project Structure

```
QA_Forum/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── questions/         # Question-related pages
│   ├── profile/           # User profile pages
│   └── admin-panel/       # Admin panel
├── components/            # Reusable components
├── models/               # MongoDB models
├── lib/                  # Utility functions
├── scripts/              # Database setup scripts
└── public/               # Static assets
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
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Use Railway's MongoDB integration
- **DigitalOcean**: Deploy with App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the admin panel guide

---

**Built with ❤️ using Next.js, MongoDB, and the InfinityFX design system**
