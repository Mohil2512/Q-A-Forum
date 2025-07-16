# StackIt Admin Panel Setup Guide

## 🚀 Quick Start

### 1. Database Setup

First, seed the database with test data including admin accounts:

```bash
npm run seed
```

This will:
- Create all necessary database indexes for optimal performance
- Create a master admin account
- Create sample test users
- Create sample questions, answers, and tags
- Display database statistics

### 2. Available Admin Accounts

After running the setup, you'll have these accounts available:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Master Admin | `master@stackit.com` | `password123` | Full administrative access |
| Test User | `john@example.com` | `password123` | Standard user account |
| Test User | `sarah@example.com` | `password123` | Standard user account |

### 3. Accessing the Admin Panel

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin panel:
   - Go to `http://localhost:3000/admin-panel`
   - Or sign in with admin credentials and click "Admin Panel" in the user menu

3. Sign in with one of the admin accounts above

## 🔧 Admin Panel Features

### User Management
- **View all users** with their roles, reputation, and status
- **Ban/Unban users** for violations
- **Suspend users** temporarily with custom duration and reason
- **View user statistics** (questions asked, answers given, etc.)

### Content Moderation
- **View all questions** and their details
- **Delete inappropriate questions** with confirmation
- **View all answers** and their context
- **Delete inappropriate answers** with confirmation

### Statistics Dashboard
- **Total users** count
- **Total questions** count
- **Total answers** count
- **Banned users** count

## 🛡️ Security Features

### Role-Based Access
- **Master Admin**: Full access to all features
- **Admin**: Access to user management and content moderation
- **Regular Users**: No admin access

### User Protection
- **Ban System**: Permanently ban users for serious violations
- **Suspension System**: Temporarily suspend users with custom duration
- **Reputation System**: Track user contributions and behavior

## 📊 Database Structure

The setup creates the following collections with optimized indexes:

### Users Collection
- Email and username uniqueness constraints
- Role-based indexing
- Ban and suspension status indexing

### Questions Collection
- Full-text search on title and content
- Author, tags, and date indexing
- Vote and view count indexing

### Answers Collection
- Question and author indexing
- Vote count indexing
- Acceptance status indexing

### Notifications Collection
- Recipient and read status indexing
- Date-based sorting

## 🔄 Maintenance

### Regular Tasks
1. **Monitor user reports** through the admin panel
2. **Review flagged content** and take appropriate action
3. **Check suspension status** and unsuspend users when appropriate
4. **Monitor system statistics** for unusual activity

### Database Maintenance
- The setup script can be run multiple times safely
- Existing data will be preserved
- Only missing indexes and accounts will be created

## 🚨 Emergency Procedures

### If Admin Access is Lost
1. Run the seed script again: `npm run seed`
2. This will recreate the master admin account
3. Use the credentials: `master@stackit.com` / `password123`

### If Database Connection Fails
1. Check your MongoDB connection string in `.env.local`
2. Ensure MongoDB is running
3. Verify network connectivity

## 📝 Customization

### Adding New Admin Features
1. Update the admin panel component in `app/admin-panel/page.tsx`
2. Add corresponding API routes in `app/api/admin/`
3. Update the database models if needed

### Modifying User Roles
1. Edit the User model in `models/User.ts`
2. Update role validation in API routes
3. Modify admin panel access controls

## 🆘 Support

If you encounter any issues:

1. **Check the console logs** for error messages
2. **Verify database connectivity** and credentials
3. **Ensure all dependencies** are installed: `npm install`
4. **Check the MongoDB logs** for connection issues

## 🔐 Security Best Practices

1. **Change default passwords** after first login
2. **Use strong passwords** for admin accounts
3. **Regularly review** admin access logs
4. **Monitor for suspicious activity** in the admin panel
5. **Keep the application updated** with security patches

---

**Note**: This admin panel is designed for the StackIt Q&A platform with modern InfinityFX-inspired UI and comprehensive moderation tools. 