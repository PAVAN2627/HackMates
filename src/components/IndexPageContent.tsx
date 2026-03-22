import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Rocket, MessageCircle, Shield, Award, User, Zap, Heart, Target, CheckCircle, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypewriterText } from '@/components/TypewriterText';
import { ThemeToggle } from '@/components/ThemeToggle';

interface IndexPageContentProps {
  hackathons: any[];
}

export function IndexPageContent({ hackathons }: IndexPageContentProps) {
  const navigate = useNavigate();

  const handleExploreHackathons = () => {
    navigate('/explore');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleJoinHackathon = () => {
    navigate('/auth');
  };

  const features = [
    {
      icon: Trophy,
      title: 'Discover & Host Hackathons',
      description: 'Browse hackathons across India filtered by skills, location, and mode. Or host your own — manage participants, set requirements, and send announcements effortlessly.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Smart Team Matching',
      description: 'AI-powered synergy scoring finds compatible teammates based on work style, goals (win vs learn), schedule, and commitment. Filter by skills, experience, and reliability.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Reliability & Trust System',
      description: 'Build credibility with our 4-tier badge system (Newbie → Reliable → Finisher → Legend). Rate teammates after hackathons and check trust scores before joining any team.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'AI-Powered Assistant',
      description: 'Get personalized guidance from our Gemini AI mentor — project ideas tailored to your skills, technical help, pitch coaching, and step-by-step platform guidance.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Communication',
      description: 'Direct messages, hackathon group chats, and team-specific chat rooms. Organizers post announcements with unread tracking and instant email notifications.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Award,
      title: 'Developer Profiles & Reputation',
      description: 'Showcase skills, work style, and achievements. Display reliability badges and synergy scores. Build your reputation across every hackathon you participate in.',
      gradient: 'from-cyan-500 to-blue-500'
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Desktop Navigation - Hidden on Mobile */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/hackmatesroundlogo.png" 
              alt="HackMates Logo" 
              className="h-10 w-16 rounded-lg object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              HackMates
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="text-slate-600 hover:text-purple-600"
              onClick={handleExploreHackathons}
            >
              Explore Hackathons
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Top Bar with Logo and Theme Toggle */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/hackmatesroundlogo.png" 
              alt="HackMates Logo" 
              className="h-8 w-14 rounded-lg object-contain"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              HackMates
            </span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-3">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-slate-600 hover:text-purple-600"
            onClick={handleExploreHackathons}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Explore</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-slate-600 hover:text-purple-600"
            onClick={handleJoinHackathon}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Join</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-slate-600 hover:text-purple-600"
            onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs">Features</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-slate-600 hover:text-purple-600"
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">About</span>
          </Button>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="relative pt-20 md:pt-32 pb-2 md:pb-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 right-1/3 w-36 md:w-72 h-36 md:h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '-6s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700 mb-6 md:mb-8">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
              <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                India's Premier Hackathon Community Platform
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 leading-tight min-h-[100px] md:min-h-[160px] lg:min-h-[240px]">
              <TypewriterText 
                lines={["Find Your", "Perfect", "Hack Partner"]}
                delay={120}
                lineDelay={800}
                className="space-y-1 md:space-y-2"
              />
            </h1>
            
            <p className="text-base md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              AI-powered platform with smart team matching, reliability badges, and synergy scoring. 
              Connect with talented developers, discover hackathons, and build winning teams with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-4 md:mb-6 px-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto"
                onClick={handleGetStarted}
              >
                Start Your Journey
                <Rocket className="h-4 md:h-5 w-4 md:w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:bg-purple-50 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto"
                onClick={handleExploreHackathons}
              >
                Explore Hackathons
                <Trophy className="h-4 md:h-5 w-4 md:w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Platform Section - Mobile Optimized */}
      <section id="about-section" className="py-4 md:py-6 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <img 
                src="/assets/hackmatesroundlogo.png" 
                alt="HackMates Platform Logo" 
                className="h-20 w-32 md:h-28 md:w-48 lg:h-32 lg:w-56 object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HackMates
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6 md:mb-8 leading-relaxed px-4">
              HackMates is India's premier hackathon community platform designed to bridge the gap between 
              talented individuals and innovative opportunities. We believe that the best solutions emerge 
              when diverse minds collaborate, and our platform makes it effortless to find your perfect 
              hackathon partner.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12 px-4">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  To democratize innovation by connecting passionate developers, designers, and creators 
                  across India's vibrant tech ecosystem.
                </p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Heart className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Our Values</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Collaboration, innovation, and inclusivity drive everything we do. We celebrate 
                  diversity and believe every voice matters in shaping the future.
                </p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Rocket className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Our Vision</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  To become the go-to platform where India's next breakthrough innovations are born 
                  through meaningful collaborations and hackathon experiences.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl md:rounded-2xl p-6 md:p-8 border border-purple-200 dark:border-purple-700 mx-4">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                Why Choose HackMates?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">AI-powered hackathon mentor & guidance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">4-tier reliability & trust badge system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Smart synergy matching algorithm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Real-time communication & announcements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Team feedback & rating system</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Intelligent profile recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Work style & commitment matching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Comprehensive hackathon discovery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Open to all — students, professionals, anyone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Off-platform team support for any hackathon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section id="features-section" className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4">
              HackMates provides all the tools and connections you need for an amazing hackathon experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className={`h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 md:mb-6 group-hover:shadow-lg group-hover:scale-110 transition-all`}>
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-slate-800 dark:text-slate-200">{feature.title}</h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-16 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden mx-4">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                Ready to build something amazing?
              </h2>
              <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto opacity-90 px-4">
                Join HackMates today and connect with India's most talented developers, designers, and innovators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto"
                  onClick={handleGetStarted}
                >
                  Join HackMates
                  <ArrowRight className="h-4 md:h-5 w-4 md:w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto"
                  onClick={handleExploreHackathons}
                >
                  Explore Hackathons
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="border-t border-white/20 py-8 md:py-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <img 
                  src="/assets/hackmatesroundlogo.png" 
                  alt="HackMates Logo" 
                  className="h-8 w-14 md:h-10 md:w-16 rounded-lg object-contain"
                />
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  HackMates
                </span>
              </div>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-3 md:mb-4 max-w-md">
                India's premier hackathon community platform connecting developers, designers, and innovators to build the future together.
              </p>
              <div className="flex gap-3 md:gap-4">
                {/* Instagram */}
                <a
                  href="https://instagram.com/hackmates.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-purple-600 transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/hackmates.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-purple-600 transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 mb-3 md:mb-4">Platform</h4>
              <ul className="space-y-1 md:space-y-2">
                <li><Link to="/explore" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">Browse Hackathons</Link></li>
                <li><Link to="/auth" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">Get Started</Link></li>
                <li><Link to="/auth" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">Post a Hackathon</Link></li>
                <li><Link to="/register" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">Create Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 mb-3 md:mb-4">Legal</h4>
              <ul className="space-y-1 md:space-y-2">
                <li><Link to="/faq" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">FAQ</Link></li>
                <li><Link to="/privacy" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">Terms of Service</Link></li>
                <li>
                  <Link to="/contact" className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 px-4">
              © 2026 HackMates. Built by <a href="https://hackmates.tech" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">hackmates.tech</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
