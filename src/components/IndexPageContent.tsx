import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Users, Code, Globe, Rocket, MessageCircle, Calendar, Shield, Award, ChevronRight, Mail, Code2, Plus, Megaphone, User, Star, Zap, Heart, Target, CheckCircle, Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TypewriterText } from '@/components/TypewriterText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

interface IndexPageContentProps {
  hackathons: any[];
  signIn: (email: string, password: string) => Promise<void>;
}

export function IndexPageContent({ hackathons, signIn }: IndexPageContentProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleExploreHackathons = () => {
    navigate('/explore');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back to HackMates!');
        navigate('/hackathons');
      } else {
        navigate('/register');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: 'Active Hackathons', value: `${hackathons.length}+`, icon: Trophy, color: 'text-purple-500' },
    { label: 'Registered Developers', value: '15,000+', icon: Users, color: 'text-blue-500' },
    { label: 'Teams Formed', value: '3,200+', icon: Code, color: 'text-green-500' },
    { label: 'Success Stories', value: '850+', icon: Star, color: 'text-yellow-500' },
  ];

  const features = [
    {
      icon: Trophy,
      title: 'Discover Amazing Hackathons',
      description: 'Browse through hundreds of hackathons across India. Filter by skills, location, mode, and find the perfect event that matches your interests and expertise.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Plus,
      title: 'Host Your Own Event',
      description: 'Organize hackathons effortlessly. Set requirements, manage participants, and create memorable experiences for the developer community.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Find Perfect Teammates',
      description: 'Connect with talented developers, designers, and innovators. Search by skills, experience level, and availability to build your dream team.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: MessageCircle,
      title: 'Seamless Communication',
      description: 'Chat directly with team members and participants. Stay connected before, during, and after hackathons with our built-in messaging system.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Megaphone,
      title: 'Real-time Updates',
      description: 'Never miss important announcements. Get instant notifications about hackathon updates, deadlines, and important information.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Award,
      title: 'Showcase Your Skills',
      description: 'Build a comprehensive profile showcasing your skills, projects, and achievements. Let others discover your expertise and collaborate.',
      gradient: 'from-pink-500 to-rose-500'
    },
  ];

  const testimonials = [
    {
      name: 'Arjun Sharma',
      role: 'Full Stack Developer',
      company: 'Tech Startup',
      content: 'HackMates helped me find amazing teammates for multiple hackathons. The platform is intuitive and the community is incredibly supportive!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun'
    },
    {
      name: 'Priya Patel',
      role: 'UI/UX Designer',
      company: 'Design Agency',
      content: 'As a designer, finding developer teammates was always challenging. HackMates made it so easy to connect with skilled developers who appreciate good design.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
    },
    {
      name: 'Rahul Kumar',
      role: 'Student',
      company: 'IIT Delhi',
      content: 'I\'ve participated in 8 hackathons through HackMates and won 3 of them! The platform helped me grow as a developer and build lasting connections.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/roundlogohackmates.png" 
              alt="HackMates Logo" 
              className="h-10 w-10 rounded-full"
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
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '-6s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700 mb-8">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                India's Premier Hackathon Community Platform
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight min-h-[200px] md:min-h-[300px]">
              <TypewriterText 
                lines={["Find Your", "Perfect", "Hack Partner"]}
                delay={120}
                lineDelay={800}
                className="space-y-2"
              />
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with talented developers, designers, and innovators across India. 
              Discover hackathons, form dream teams, and build solutions that matter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl text-lg px-8 py-4 h-auto"
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Your Journey
                <Rocket className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:bg-purple-50 text-lg px-8 py-4 h-auto"
                onClick={handleExploreHackathons}
              >
                Explore Hackathons
                <Trophy className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Platform Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-12">
              <img 
                src="/assets/squarelogohackmates.png" 
                alt="HackMates Platform Logo" 
                className="h-32 w-32 md:h-40 md:w-40 rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HackMates
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              HackMates is India's premier hackathon community platform designed to bridge the gap between 
              talented individuals and innovative opportunities. We believe that the best solutions emerge 
              when diverse minds collaborate, and our platform makes it effortless to find your perfect 
              hackathon partner.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  To democratize innovation by connecting passionate developers, designers, and creators 
                  across India's vibrant tech ecosystem.
                </p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Our Values</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Collaboration, innovation, and inclusivity drive everything we do. We celebrate 
                  diversity and believe every voice matters in shaping the future.
                </p>
              </div>
              
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">Our Vision</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  To become the go-to platform where India's next breakthrough innovations are born 
                  through meaningful collaborations and hackathon experiences.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                Why Choose HackMates?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Verified developer profiles with skill matching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Real-time communication and collaboration tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Comprehensive hackathon discovery and filtering</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Seamless event management for organizers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Active community of 15,000+ developers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Success stories from 850+ winning teams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              HackMates provides all the tools and connections you need for an amazing hackathon experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:scale-110 transition-all`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Benefits */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Join the{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Community
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
                Whether you're a seasoned developer, creative designer, or passionate student, 
                HackMates connects you with like-minded innovators ready to build the future.
              </p>
              
              <div className="space-y-6">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-500" />
                    For Hackathon Organizers
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Host hackathons with detailed event pages',
                      'Manage participants and team formations',
                      'Send real-time announcements to participants',
                      'Track event analytics and engagement'
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    For Participants
                  </h3>
                  <ul className="space-y-2">
                    {[
                      'Discover hackathons matching your skills',
                      'Find teammates with complementary expertise',
                      'Build your developer profile and portfolio',
                      'Network with the tech community'
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Auth Form */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex gap-2 mb-8">
                <Button
                  variant={isLogin ? 'default' : 'ghost'}
                  className={`flex-1 ${isLogin ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </Button>
                <Button
                  variant={!isLogin ? 'default' : 'ghost'}
                  className={`flex-1 ${!isLogin ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-700 mb-4">
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">🚀 Ready to Join HackMates?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Create your complete profile with skills, experience, and showcase your projects!
                    </p>
                    <Button 
                      type="button" 
                      onClick={() => navigate('/register')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Start Registration →
                    </Button>
                  </div>
                )}

                {isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-slate-200 dark:border-slate-700 focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="border-slate-200 dark:border-slate-700 focus:border-purple-500"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white" 
                      size="lg" 
                      disabled={submitting}
                    >
                      {submitting ? 'Please wait...' : 'Login to HackMates'}
                    </Button>
                  </>
                )}
              </form>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    if (isLogin) {
                      navigate('/register');
                    } else {
                      setIsLogin(!isLogin);
                    }
                  }}
                  className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What our{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                community
              </span>{' '}
              says
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join thousands of developers who have found their perfect hackathon partners through HackMates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to build something amazing?
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Join HackMates today and connect with India's most talented developers, designers, and innovators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
                  onClick={() => navigate('/register')}
                >
                  Join HackMates
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 h-auto"
                  onClick={handleExploreHackathons}
                >
                  Explore Hackathons
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/assets/roundlogohackmates.png" 
                  alt="HackMates Logo" 
                  className="h-10 w-10 rounded-full"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  HackMates
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md">
                India's premier hackathon community platform connecting developers, designers, and innovators to build the future together.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-purple-600">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-purple-600">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-purple-600">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/explore" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Browse Hackathons</Link></li>
                <li><Link to="/auth" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Find Members</Link></li>
                <li><Link to="/auth" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Host Event</Link></li>
                <li><Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Join Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Help Center</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Community Guidelines</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-purple-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              © 2025 HackMates. Built with <Heart className="h-4 w-4 inline text-red-500" /> for the NoobCodersIND developer community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}