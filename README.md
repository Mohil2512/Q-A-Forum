# StackIt - QA Forum Platform

[Try it](stack1t.vercel.app/)

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
Run the database setup script to initialize the database with sample data:

```bash
npm run setup-db
```

This will create:
- Database indexes for optimal performance
- Default user accounts (see below)
- Sample questions, answers, and tags
- Sample notifications

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 👥 Default Accounts

After running the database setup, you'll have these default accounts:

### Master Admin
- **Email**: `master@stackit.com`
- **Password**: `master123`
- **Role**: Master Admin (full access)

### Regular Admin
- **Email**: `admin@stackit.com`
- **Password**: `admin123`
- **Role**: Admin (moderation access)

### Demo User
- **Email**: `user@stackit.com`
- **Password**: `user123`
- **Role**: Regular User

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
- ✅ **Database Setup**: Comprehensive initialization script
- ✅ **API Endpoints**: All notification and admin APIs implemented
- ✅ **Authentication**: Proper session handling
- ✅ **Error Handling**: Improved error messages and validation

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
