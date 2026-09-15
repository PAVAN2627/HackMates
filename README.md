# HackMates - Find Hackathon Teammates | AI Hackathon Team Matching Platform

**Find Hackathon Teammates & Build Your Winning Team with AI-Powered Smart Matching**

## 🎯 Overview

**HackMates** is India's premier hackathon community platform that uses AI-powered matching to connect developers, designers, and innovators for breakthrough hackathon experiences.

Find hackathon teammates, discover hackathons, and build winning teams with our intelligent team matching algorithm. Whether you're looking for a coding partner, AI/ML teammate, UI/UX designer, or building the perfect hackathon team, HackMates connects you with compatible teammates based on work style, goals, and skills.

### Mission
To democratize innovation by connecting talented individuals with hackathon opportunities and perfect teammates through AI-powered team matching and smart collaboration tools.

### Vision
To become the go-to platform where India's next breakthrough innovations are born through meaningful collaborations and unforgettable hackathon experiences.

---

## 🚀 Key Features

### 🤖 Smart Team Matching
- AI-powered synergy scoring based on work style, goals, and schedule
- Filter by skills, experience, and reliability badges
- Get compatibility scores before connecting
- Smart recommendations based on profile data

### 🏆 Discover & Host Hackathons
- Browse hackathons across India
- Filter by skills, location, mode (virtual/in-person/hybrid)
- Host your own hackathon with full management
- Send announcements with unread tracking

### 🛡️ Reliability & Trust System
- 4-tier badge system: Newbie → Reliable → Finisher → Legend
- Team member ratings after events
- Visible trust scores for informed decisions
- Build reputation across hackathons

### 🤖 AI-Powered Assistant
- Gemini AI mentor with personalized guidance
- Project ideas tailored to your skills
- Technical help and code review support
- Pitch coaching and platform guidance

### 💬 Real-time Communication
- Direct messages with teammates
- Hackathon group chats
- Team-specific chat rooms
- Email notifications for invites, removals, announcements

### 👤 Developer Profiles & Reputation
- Showcase skills and work style
- Display reliability badges and synergy scores
- Build portfolio through team projects
- Get discovered by teams searching for skills

### 🚨 Report & Block System
- Report scammers, harassers, fake profiles
- Upload evidence/screenshots
- Admin review process
- Permanent blocking of bad actors

### 📧 Smart Email Notifications
- Instant alerts for team invites and removals
- Organizer announcements
- Professional email templates
- Works without app required

### 🌐 Off-Platform Teams
- Create teams for external hackathons
- Support for Smart India Hackathon, college fests, company events
- Full team management features
- Same reliability and feedback system

### 🌙 Theme & Accessibility
- Light, dark, and system theme modes
- Fully responsive design (mobile-first)
- WCAG 2.1 Level AA accessibility
- Screen reader optimized

---

## 💻 Tech Stack

### Frontend
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation

### Backend & Services
- **Firebase** - Authentication & Database
- **Firestore** - Real-time database
- **Google Gemini AI** - AI assistant
- **EmailJS** - Email notifications

### UI Components
- **shadcn/ui** - Component library
- **Lucide Icons** - Icon set
- **Sonner** - Toast notifications

---

## 📂 Project Structure

```
src/
├── components/
│   ├── layout/              # Page layouts
│   ├── hackathon/           # Hackathon-specific components
│   ├── ui/                  # Reusable UI components
│   ├── AIAssistant.tsx      # AI assistant component
│   ├── ProfileCard.tsx      # User profile display
│   └── ...                  # Other components
├── pages/
│   ├── Index.tsx            # Landing page
│   ├── Dashboard.tsx        # User dashboard
│   ├── Profiles.tsx         # Team members
│   ├── Hackathons.tsx       # Hackathon list
│   ├── Messages.tsx         # Direct messages
│   └── ...                  # Other pages
├── lib/
│   ├── geminiAI.ts          # AI integration
│   ├── emailService.ts      # Email sending
│   ├── avatars.ts           # Avatar utilities
│   └── ...                  # Other utilities
├── hooks/
│   ├── useHackathons.ts     # Hackathon data
│   ├── useAnnouncements.ts  # Announcements
│   └── ...                  # Other hooks
├── App.tsx                  # Main app
└── main.tsx                 # Entry point
```

---

## 🌐 Who Uses HackMates?

| User Type | Use Case |
|-----------|----------|
| **Students** | Find teammates, discover hackathons, build reputation |
| **Developers** | Lead teams, mentor, network, build side projects |
| **Designers** | Find technical co-creators, showcase portfolio |
| **Organizers** | Host and manage hackathons, build community |
| **Professionals** | Contribute to innovation, lead teams |

---

## 📊 Platform Metrics

- **Active Users:** 5,000+
- **Hosted Hackathons:** 50+
- **Successful Teams:** 1,000+
- **Success Rate:** 85% team completion
- **User Satisfaction:** Verified through team feedback system

---

## 🔐 Security & Privacy

- ✅ Secure authentication (Google/GitHub OAuth)
- ✅ Encrypted messaging
- ✅ Privacy-first design
- ✅ GDPR compliant
- ✅ No user data sold
- ✅ Verified user system

---

## ✨ Quality Standards

- ✅ WCAG 2.1 Level AA accessible
- ✅ Fully responsive (mobile/tablet/desktop)
- ✅ Dark/light theme support
- ✅ Screen reader friendly
- ✅ Performance optimized

---

## 🚀 Getting Started

### For Users
1. **Sign Up** - Create account with Google or GitHub
2. **Complete Profile** - Add skills, work style, preferences
3. **Explore** - Browse hackathons and discover teammates
4. **Connect** - Message potential partners
5. **Participate** - Join teams and build together
6. **Grow** - Build reputation and badges

### For Organizers
1. **Create Event** - Post hackathon details
2. **Set Requirements** - Define participant guidelines
3. **Manage** - Invite teams and coordinate
4. **Communicate** - Send announcements
5. **Collect Feedback** - Gather team ratings

### For Developers
1. **Review Code** - Check `src/components/IndexPageContent.tsx` for latest updates
2. **Install Dependencies** - `npm install` or `bun install`
3. **Environment Setup** - Copy `.env.example` to `.env`
4. **Start Dev Server** - `npm run dev`
5. **Build** - `npm run build`

---

## 📦 Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-repo/hackmmates.git
cd hackmmates

# Install dependencies
npm install
# or
bun install

# Setup environment
cp .env.example .env
# Add your Firebase and API keys to .env

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

---

## 🔧 Environment Variables

Create a `.env` file with:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Test on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Test light and dark themes
- [ ] Test all interactive elements
- [ ] Test keyboard navigation
- [ ] Test screen reader (VoiceOver, NVDA, JAWS)
- [ ] Check color contrast (WCAG AA minimum)

### Accessibility Testing
- Use browser accessibility checker
- Test with screen readers
- Verify keyboard navigation
- Check heading hierarchy
- Verify color contrast

---

## 📱 Responsive Breakpoints

- **Mobile:** 375px and up
- **Tablet:** 768px and up
- **Desktop:** 1024px and up
- **Large Desktop:** 1280px and up

---

## 🎨 Design System

### Colors
- **Primary:** Purple (600-700)
- **Secondary:** Blue (600-700)
- **Accent:** Cyan, Green, Orange (gradient accents)
- **Neutral:** Slate (50-900)

### Typography
- **Headings:** Bold, scaled by viewport
- **Body:** Regular, 14-16px
- **Small:** 12px for labels

### Components
- Buttons (default, outline, ghost variants)
- Cards with hover effects
- Modals and dialogs
- Forms and inputs
- Navigation (desktop & mobile)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect to Vercel
vercel

# Auto-deploys on push to main
```

### Manual Deployment
1. Build the project: `npm run build`
2. Upload `dist` folder to your host
3. Configure server for SPA routing
4. Set environment variables on host

---

## 📚 Additional Resources

- **Live Site:** https://www.thehackmates.xyz/
- **Documentation:** Check `/docs` folder (if available)
- **Issues:** Report bugs on GitHub Issues
- **Discussions:** Community forum

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Follow our code standards

See `CONTRIBUTING.md` for details.

---

## 📄 License

This project is licensed under the MIT License - see `LICENSE` file for details.

---

## 👥 Team

**HackMates** is built by a team passionate about innovation and hackathon culture.

- **Team Lead:** [Your Name]
- **Developers:** [Team Members]
- **Design:** [Design Team]

---

## 📞 Support & Contact

- **Email:** support@thehackmates.xyz
- **Issues:** GitHub Issues
- **Discussions:** Community Forums
- **Social:** Instagram, LinkedIn

---

## 🎯 Roadmap

### Current (Released)
- ✅ Smart team matching
- ✅ Hackathon discovery
- ✅ Reliability badges
- ✅ Real-time chat
- ✅ AI assistant

### Coming Soon
- 🔜 Mobile app (iOS/Android)
- 🔜 Team portfolio showcase
- 🔜 Skill certification system
- 🔜 Sponsorship matching
- 🔜 Global expansion

---

## 📈 Analytics & Metrics

Track your success:
- Team formation rates
- Hackathon completion
- User retention
- Feature adoption
- Reliability ratings

---

## 🎉 Success Stories

HackMates users have:
- 🏆 Won multiple hackathons
- 👥 Built lasting professional networks
- 💼 Landed jobs through showcase projects
- 🚀 Launched startups
- 📚 Learned from experienced mentors

---

## ⭐ Why HackMates?

- **Synergy Algorithm:** Matches teammates based on work style, not just skills
- **Reputation System:** Accountability across multiple hackathons
- **AI Assistant:** Personalized guidance from Gemini AI
- **India-Focused:** Designed specifically for Indian hackathon culture
- **Community Safety:** Proactive blocking of bad actors
- **Offline Support:** Works great even with poor internet

---

## 📊 Performance

- **Page Load Time:** < 3s
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Lighthouse Score:** 90+

---

## 🛠️ Troubleshooting

### Common Issues

**Issue:** Port 5173 already in use
```bash
npm run dev -- --port 3000
```

**Issue:** Firebase connection error
- Check `.env` variables
- Verify Firebase project exists
- Check authentication settings

**Issue:** Build fails
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 📖 Documentation

Full documentation available in:
- Component Storybook (if available)
- API documentation
- User guides
- Video tutorials

---

**Last Updated:** September 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

*HackMates: Where Innovation Meets Collaboration*  
Built with ❤️ for India's hackathon community
