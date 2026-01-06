# HackMates - Hackathon Discovery & Team Formation Platform
**Developed by team NoobcodersIND**

## 📋 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Feature Documentation](#feature-documentation)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Deployment Guide](#deployment-guide)
6. [User Guide](#user-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Platform Overview

**HackMates** is a comprehensive hackathon discovery and team formation platform that connects developers, designers, and creators from around India. Find the perfect hackathon for your skills or post your own. Built with modern web technologies for seamless real-time interaction and community building. Developed by **NoobcodersIND**.

### Key Features
- **Profile Discovery**: Search and find team members by skills, location, and availability
- **Hackathon Posting**: Any user can post and organize hackathons
- **Real-time Communication**: Direct messaging and general hackathon chat
- **Skill-based Matching**: Find hackathons and collaborators by skills
- **Team Formation**: Easy team joining and management
- **Mobile Responsive**: Optimized for all devices with adaptive navigation
- **Theme Support**: Light, dark, and system theme modes

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **Deployment**: Vercel
- **Real-time**: Firebase Firestore real-time listeners

---

## 👥 User System

### 🎯 Unified User Registration
**All users have the same capabilities:**
- Create and manage hackathons
- Join hackathons and form teams
- Search and connect with other users
- Direct messaging
- Profile customization with skills and bio
- Real-time notifications

**Available Features:**
- Hackathon posting and discovery
- Profile search and team member discovery
- Direct messaging system
- Real-time notifications
- Theme customization (light/dark/system)
- Mobile-responsive interface

---

## 🎨 Feature Documentation

### 1. Authentication System
**Technology**: Firebase Authentication
**Features:**
- Email/password authentication
- Automatic profile creation with detailed fields
- Secure session management
- Real-time authentication state

**User Flow:**
1. User registers or signs in with email/password
2. Profile created with name, college, location, skills, bio, availability
3. Redirected to hackathons page
4. Profile discoverable to other users

### 2. Hackathon Management
**Posting Hackathons:**
- Any user can post hackathons
- Create with title, description, venue, location, date, time, mode
- Specify required skills
- Track participants
- Open/close hackathons for new members

**Discovering Hackathons:**
- Browse all hackathons
- Filter by skills, mode (online/in-person/both), status
- Search by title or description
- View hackathon details and required skills
- Join hackathons and form teams

### 3. Real-time Communication System

#### 📱 Direct Messaging
**Features:**
- One-on-one conversations with other users
- Real-time message delivery
- Read status indicators

#### 💬 Hackathon Chat
**Features:**
- Event-specific group chat
- Real-time messaging for all hackathon members
- Message history

### 4. Profile Discovery System

#### 🔍 Find Team Members
**Features:**
- Search profiles by name or bio
- Filter by skills, location, availability (online/in-person/both)
- View detailed user profiles with skills and bio
- Direct message to connect with potential teammates
- Identify users looking for teams

### 5. Announcement System
**Features:**
- Rich content announcements
- Real-time delivery to participants
- Unread notification tracking
- Hackathon-specific announcements

### 6. Profile Management
**Features:**
- Avatar upload and management
- Personal information (bio, college, skills)
- Social media links (LinkedIn, GitHub, portfolio)
- Activity tracking and contributions
- Profile cards and modal views

### 7. Theme System
**Features:**
- Light, dark, and system theme modes
- Persistent theme selection
- Smooth theme transitions
- Available on all pages including landing page

### 8. Mobile-Responsive Design

#### 📱 Mobile Navigation
**Features:**
- Bottom navigation bar for mobile
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized performance

#### 💻 Desktop Navigation
**Features:**
- Vertical sidebar navigation
- Full navigation menu
- User profile dropdown

---

## 🏗️ Technical Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   └── hackathon/      # Hackathon components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```

### State Management
- **React Context**: Authentication and theme management
- **Custom Hooks**: Data fetching and business logic
- **Firebase Client**: Real-time data synchronization

### Real-time Features
- **Firebase Listeners**: Real-time data updates
- **Live Updates**: Messages, hackathon changes, announcements
- **Optimistic Updates**: Immediate UI feedback

---

## 🗄️ Database Schema (Firebase Firestore)

### Core Collections

#### `users`
```typescript
interface UserProfile {
  id: string;
  uid: string; // Firebase auth UID
  name: string;
  email: string;
  college: string;
  location: string;
  skills: string[];
  bio: string;
  availableFor: 'online' | 'in-person' | 'both';
  lookingForTeam: boolean;
  avatar?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  experience?: string;
  interests?: string[];
  gender?: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

#### `hackathons`
```typescript
interface Hackathon {
  id: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  date: string; // ISO format
  time: string; // HH:mm format
  mode: 'online' | 'in-person' | 'both';
  requiredSkills?: string[];
  creatorId: string;
  creatorName: string;
  status: 'open' | 'closed';
  teamMembers?: string[]; // User IDs
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

#### `hackathonChat`
```typescript
interface HackathonChatMessage {
  id: string;
  hackathonId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}
```

#### `directMessages`
```typescript
interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}
```

#### `announcements`
```typescript
interface Announcement {
  id: string;
  hackathonId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  createdAt: Date;
}
```

### Firebase Storage
- **hackathon-images**: Event posters and media
- **user-avatars**: Profile pictures

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled with specific policies:

#### Profile Policies
- **SELECT**: Public (anyone can view profiles)
- **INSERT/UPDATE**: Own profile only
- **DELETE**: Not allowed

#### Content Policies
- **Blogs/Issues**: 
  - Authors can edit/delete own content
  - Organizers can delete any content (moderation)
- **Comments**: 
  - Authors can edit/delete own comments
  - Organizers can delete any comments

#### Storage Policies
- **Public Buckets**: hackathon-images, user-avatars, blog-images
- **Private Buckets**: message-attachments, issue-attachments
- **Upload Permissions**: Based on user authentication and context

---

## 🚀 Deployment Guide

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set Firebase environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Setup
1. Create Firebase project at console.firebase.google.com
2. Enable Firestore Database and Authentication (Email/Password)
3. Configure Storage bucket for file uploads
4. Add service account credentials for backend operations

### Post-Deployment Checklist
- [ ] Firebase authentication working
- [ ] Firestore database accessible
- [ ] Real-time features active
- [ ] Mobile navigation responsive
- [ ] All pages loading correctly

---

## 📖 User Guide

### For All Users

#### Getting Started
1. **Register**: Create account with email/password and profile details
2. **Complete Profile**: Add skills, bio, college, location, availability
3. **Browse Hackathons**: Explore available hackathons
4. **Join Hackathons**: Register for events of interest

#### Using the Platform
1. **Profile Discovery**: 
   - Click "Find Team" in navigation
   - Search and filter team members by skills and location
   - Send direct messages to connect
   - Share files up to 50MB
   - Use search to find conversations

2. **Blogging**:
   - Click Blog → Create New Post
   - Use rich editor for formatting
   - Add images and tags
   - Publish and share

3. **Issue Reporting**:
   - Click Issues → Report Issue
   - Describe problem with details
   - Attach screenshots if needed
   - Track resolution progress

#### Mobile Usage
- Use bottom navigation for main features
- Tap "More" for additional options
- Swipe up for full menu overlay
- All features work on mobile

### For Organizers

#### Dashboard Access
- Organizers get additional Dashboard tab
- View statistics and analytics
- Manage hackathons and participants
- Monitor platform activity

#### Creating Hackathons
1. Go to Dashboard → Create Hackathon
2. Fill in event details
3. Upload event poster
4. Set registration limits
5. Publish event

#### Managing Events
- View participant registrations
- Post announcements
- Monitor event chat
- Update event status

#### Content Moderation
- Delete inappropriate content
- Manage user reports
- Monitor community guidelines
- Handle disputes

---

## 🛠️ Admin Guide

### User Management
- Monitor user registrations
- Assign organizer roles
- Handle user reports
- Manage banned users

### Content Moderation
- Review reported content
- Delete inappropriate posts
- Monitor community guidelines
- Handle copyright issues

### System Monitoring
- Check database performance
- Monitor storage usage
- Review error logs
- Track user engagement

### Backup & Maintenance
- Regular database backups
- Update dependencies
- Monitor security patches
- Performance optimization

---

## 🔧 Troubleshooting

### Common Issues

#### Authentication Problems
**Issue**: Users can't log in
**Solutions**:
- Check Supabase auth configuration
- Verify environment variables
- Check email confirmation settings
- Review RLS policies

#### File Upload Issues
**Issue**: Files not uploading
**Solutions**:
- Check storage bucket permissions
- Verify file size limits (50MB)
- Check supported file types
- Review storage policies

#### Real-time Features Not Working
**Issue**: Messages/notifications not updating
**Solutions**:
- Check Supabase realtime configuration
- Verify WebSocket connections
- Review subscription setup
- Check network connectivity

#### Mobile Navigation Issues
**Issue**: Navigation not responsive
**Solutions**:
- Check CSS media queries
- Verify mobile breakpoints
- Test on different devices
- Review touch interactions

### Performance Optimization

#### Database Optimization
- Add indexes for frequently queried columns
- Optimize complex queries
- Use pagination for large datasets
- Monitor query performance

#### Frontend Optimization
- Implement code splitting
- Optimize image loading
- Use React.memo for expensive components
- Minimize bundle size

#### Storage Optimization
- Compress images before upload
- Implement file cleanup routines
- Monitor storage usage
- Use CDN for static assets

---

## 📊 Analytics & Monitoring

### Key Metrics to Track
- User registrations and activity
- Hackathon participation rates
- Content creation (blogs, issues)
- Message volume and engagement
- File upload usage
- Mobile vs desktop usage

### Monitoring Tools
- Supabase Dashboard for database metrics
- Vercel Analytics for performance
- Browser console for client-side errors
- Custom logging for business metrics

---

## 🔮 Future Enhancements

### Planned Features
- **Video Calling**: Integrate video chat for hackathons
- **Team Formation**: Automatic team matching
- **Submission System**: Project submission and judging
- **Leaderboards**: Gamification elements
- **Advanced Search**: Full-text search across content
- **Push Notifications**: Mobile app notifications
- **API Access**: Public API for third-party integrations

### Technical Improvements
- **Caching Layer**: Redis for improved performance
- **CDN Integration**: Global content delivery
- **Advanced Analytics**: Custom dashboard
- **Automated Testing**: Comprehensive test suite
- **CI/CD Pipeline**: Automated deployment
- **Monitoring**: Advanced error tracking

---

## 📞 Support & Contact

### Technical Support
- Check documentation first
- Review troubleshooting guide
- Check GitHub issues
- Contact development team

### Community Support
- Platform community forums
- User guides and tutorials
- Video walkthroughs
- FAQ section

### Emergency Contact
- Critical bugs: Immediate attention
- Security issues: Priority handling
- Data loss: Backup recovery
- Service outages: Status updates

---

**Built with ❤️ by NoobcodersIND Team**
*Empowering developers worldwide to discover, collaborate, and build amazing solutions through hackathons*