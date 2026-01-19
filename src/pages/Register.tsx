import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Zap, User, MapPin, Tag, MessageSquare, CheckCircle2, Upload, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { sendWelcomeEmail, sendWelcomeEmailGoogle } from '@/lib/emailService';
import { toast } from 'sonner';
import { z } from 'zod';
import { WorkStyleSelector } from '@/components/WorkStyleSelector';

// Google icon component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const skillsOptions = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js',
  'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
  'JavaScript', 'TypeScript', 'HTML/CSS', 'Tailwind CSS',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'DevOps',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
  'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop',
  'Blockchain', 'Web3', 'Solidity', 'Smart Contracts',
  'Game Development', 'Unity', 'Unreal Engine',
  'Cybersecurity', 'Penetration Testing', 'Ethical Hacking',
  'IoT', 'Arduino', 'Raspberry Pi', 'Embedded Systems',
  'GraphQL', 'REST APIs', 'Microservices', 'System Design'
];



const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-Binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const interestOptions = [
  'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science',
  'Blockchain', 'Game Development', 'IoT', 'Cybersecurity',
  'Cloud Computing', 'DevOps', 'UI/UX Design', 'AR/VR',
  'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Social Impact',
  'Robotics', 'Computer Vision', 'Natural Language Processing',
  'Big Data', 'Quantum Computing', 'Backend Development',
  'Frontend Development', 'Full Stack', 'API Development',
  'Database Design', 'System Architecture', 'Microservices',
  'Agritech', 'Cleantech', 'Smart Cities', 'Logistics Tech',
  '3D Modeling', 'Animation', 'Video Editing', 'Graphic Design',
  'Product Management', 'Business Analytics', 'Marketing Tech',
  'Hardware', 'Embedded Systems', 'Networking', 'Open Source'
];

const locationOptions = [
  'Bangalore', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad', 
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Indore',
  'Chandigarh', 'Lucknow', 'Nagpur', 'Bhopal', 'Coimbatore', 'Other'
];

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.union([z.string().min(6, 'Password must be at least 6 characters'), z.literal('')]).optional(),
  confirmPassword: z.union([z.string().min(6, 'Password must be at least 6 characters'), z.literal('')]).optional(),
  college: z.string().min(1, 'College/Organization name is required'),
  location: z.string().min(1, 'Location is required'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  availableFor: z.enum(['online', 'in-person', 'both']),
  experience: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  interests: z.array(z.string()).optional().default([]),
  linkedin: z.string().optional().default(''),
  github: z.string().optional().default(''),
  portfolio: z.string().optional().default(''),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
});

export default function Register() {
  const { user, loading, signUp, completeGoogleSignUp } = useAuth();
  const navigate = useNavigate();
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'email' | 'google' | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    location: '',
    customLocation: '', // For "Other" option
    skills: [] as string[],
    bio: '',
    availableFor: 'both' as 'online' | 'in-person' | 'both',
    experience: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    interests: [] as string[],
    linkedin: '',
    github: '',
    portfolio: '',
    gender: 'prefer-not-to-say' as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say',
    avatar: '' as string,
    workStyle: {
      goal: 'learn' as 'win' | 'learn',
      timePreference: 'flexible' as 'night-owl' | 'early-bird' | 'flexible',
      commitment: 'part-time' as 'full-time' | 'part-time' | 'casual',
      hoursAvailable: 20
    }
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for signup method and Google user data on component mount
  useEffect(() => {
    console.log('Register component mounted, checking signup method and Google data');
    
    // Check localStorage first, then sessionStorage for signup method
    let method = localStorage.getItem('signupMethod') as 'email' | 'google' | null;
    if (!method) {
      method = sessionStorage.getItem('signupMethod') as 'email' | 'google' | null;
    }
    console.log('Signup method from storage:', method);
    setSignupMethod(method);

    // Check sessionStorage first, then localStorage for Google user data
    let googleUserData = sessionStorage.getItem('googleUserData');
    if (!googleUserData) {
      googleUserData = localStorage.getItem('pendingGoogleSignup');
    }

    console.log('Google user data found:', !!googleUserData);

    if (googleUserData) {
      try {
        const userData = JSON.parse(googleUserData);
        console.log('Parsed Google user data:', userData);
        setIsGoogleUser(true);
        setFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          avatar: userData.avatar || '', // Don't force avatar if empty
          password: '', // No password needed for Google users
          confirmPassword: ''
        }));
        
        // Only set avatar preview if there's actually an avatar
        if (userData.avatar && userData.avatar.trim() !== '') {
          setAvatarPreview(userData.avatar);
        }
        
        // DO NOT clear storage yet - we still need it for the form submission
        // Clear will happen after successful registration
      } catch (error) {
        console.error('Error parsing Google user data:', error);
      }
    }
    
    // Mark initialization complete so redirect logic can now apply
    setHasInitialized(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Wait for initialization before applying redirect logic
  if (!hasInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Preparing profile form...</div>
      </div>
    );
  }

  // Check if this is a new Google signup flow
  // Need to check both the stored value and the state
  const storedSignupMethod = localStorage.getItem('signupMethod') || sessionStorage.getItem('signupMethod');
  const isNewGoogleSignupFlow = (signupMethod === 'google' || storedSignupMethod === 'google') && isGoogleUser;

  console.log('Redirect check - user:', !!user, 'isNewGoogleSignupFlow:', isNewGoogleSignupFlow, 'signupMethod:', signupMethod, 'isGoogleUser:', isGoogleUser);

  // If user is logged in but NOT completing a Google signup profile, redirect to dashboard
  if (user && !isNewGoogleSignupFlow) {
    console.log('Redirecting to dashboard - user is authenticated but not in Google signup flow');
    return <Navigate to="/hackathons" replace />;
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 1048487 bytes ≈ 1MB)
      if (file.size > 1048487) {
        toast.error(`Image size should be less than 1MB. Current size: ${Math.round(file.size / 1024)}KB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome back to HackMates!');
      navigate('/hackathons');
    } catch (error: any) {
      if (error.message === 'REDIRECT_TO_REGISTER') {
        // This means it's a new Google user, the data is already set in useEffect
        toast.success('Please complete your profile to get started with HackMates!');
        // The form will already be populated from the useEffect
      } else {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Debug log to help identify issues
      console.log('Form data being validated:', {
        name: formData.name,
        email: formData.email,
        college: formData.college,
        location: formData.location,
        customLocation: formData.customLocation,
        skills: formData.skills,
        bio: formData.bio,
        availableFor: formData.availableFor
      });

      const validation = registrationSchema.safeParse(formData);
      if (!validation.success) {
        console.log('Validation errors:', validation.error.errors);
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        // Show specific error messages
        const errorMessages = Object.values(fieldErrors);
        if (errorMessages.length > 0) {
          toast.error(`Please fix the following errors: ${errorMessages.join(', ')}`);
        } else {
          toast.error('Please fix the errors below');
        }
        
        setIsSubmitting(false);
        return;
      }

      // Additional validation for custom location
      if (formData.location === 'Other' && (!formData.customLocation || formData.customLocation.trim().length < 2)) {
        setErrors({ customLocation: 'Please specify your location' });
        toast.error('Please specify your location when selecting "Other"');
        setIsSubmitting(false);
        return;
      }
      
      // Password validation - only for email signup method
      if (signupMethod === 'email') {
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' });
          toast.error('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
      }

      const profileData = {
        name: formData.name,
        email: formData.email,
        college: formData.college,
        location: formData.location === 'Other' ? formData.customLocation : formData.location,
        skills: formData.skills,
        bio: formData.bio,
        availableFor: formData.availableFor,
        experience: formData.experience,
        interests: formData.interests,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
        gender: formData.gender,
        avatar: formData.avatar,
        workStyle: formData.workStyle,
        lookingForTeam: true,
      };

      if (signupMethod === 'google' && isGoogleUser) {
        // For Google users, just save profile (no additional auth popup)
        console.log('Starting Google signup with profile data:', profileData);
        await completeGoogleSignUp(profileData);
        console.log('Google signup completed successfully');
        toast.success('Registration completed successfully!');
        
        // Send welcome email for Google users (non-blocking)
        sendWelcomeEmailGoogle(formData.email, formData.name)
          .then(() => console.log('Welcome email queued for Google user'))
          .catch(err => console.error('Failed to queue welcome email:', err));
        
        // Navigate immediately to dashboard (user is already authenticated)
        console.log('Navigating to hackathons');
        navigate('/hackathons');
        return;
      } else if (signupMethod === 'email') {
        // Use regular email signup with password
        console.log('Starting email signup with profile data:', profileData);
        await signUp({
          ...profileData,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
        console.log('Email signup completed successfully');
        toast.success('Account created successfully!');
        
        // Send welcome email (non-blocking) - only for email users
        sendWelcomeEmail(formData.email, formData.name, formData.password)
          .then(() => console.log('Welcome email queued'))
          .catch(err => console.error('Failed to queue welcome email:', err));
      } else {
        // Fallback for unclear signup method
        console.error('Invalid signup method:', signupMethod);
        throw new Error('Invalid signup method. Please start over.');
      }
      
      // Clear the signup method flag
      console.log('Clearing storage and navigating to dashboard');
      sessionStorage.removeItem('signupMethod');
      localStorage.removeItem('signupMethod');
      navigate('/hackathons');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/assets/roundlogohackmates.png" 
                alt="HackMates Logo" 
                className="h-10 w-10 rounded-full"
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</h1>
            </div>
            <p className="text-muted-foreground">Create your profile and find amazing hackathons</p>
            <p className="text-xs text-muted-foreground mt-2">Developed by NoobcodersIND</p>
          </div>

          {/* Registration Form */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            {/* Google User Indicator - shown when user came from Google OAuth */}
            {isGoogleUser && signupMethod === 'google' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Signed in with Google
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      Complete your profile to get started (no password needed)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Signup Indicator */}
            {signupMethod === 'email' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  📧 Signing up with Email & Password
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h2>

                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    {!avatarPreview ? (
                      <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-primary/60" />
                          <p className="text-xs text-primary/60">Upload Photo</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Photo size must be less than 1MB
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    {isGoogleUser && <p className="text-xs text-muted-foreground mt-1">You can edit the name from your Google account</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'border-red-500' : ''}
                      readOnly={isGoogleUser}
                      disabled={isGoogleUser}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    {isGoogleUser && <p className="text-xs text-muted-foreground mt-1">Email from Google account</p>}
                  </div>
                </div>

                {/* Password fields - only for email signup users */}
                {signupMethod === 'email' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Education & Location */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Education & Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="college">College/University *</Label>
                    <Input
                      id="college"
                      type="text"
                      placeholder="Your college name"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className={errors.college ? 'border-red-500' : ''}
                    />
                    {errors.college && <p className="text-sm text-red-500 mt-1">{errors.college}</p>}
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <select
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value, customLocation: '' })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="">Select location</option>
                      {locationOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                    
                    {/* Custom location input when "Other" is selected */}
                    {formData.location === 'Other' && (
                      <div className="mt-2">
                        <Input
                          type="text"
                          placeholder="Enter your location"
                          value={formData.customLocation}
                          onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                          className={`w-full ${errors.customLocation ? 'border-red-500' : ''}`}
                        />
                        {errors.customLocation && <p className="text-sm text-red-500 mt-1">{errors.customLocation}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Skills *
                </h2>
                <p className="text-sm text-muted-foreground">Select your technical skills</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {skillsOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        formData.skills.includes(skill)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {formData.skills.includes(skill) && <CheckCircle2 className="w-3 h-3" />}
                        {skill}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.skills && <p className="text-sm text-red-500">{errors.skills}</p>}
              </div>

              {/* Experience & Interests */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Experience & Interests
                </h2>

                <div>
                  <Label>Experience Level *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    {experienceOptions.map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, experience: level as any })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-center ${
                          formData.experience === level
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Gender (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {genderOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: option.value as any })}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-center text-sm ${
                          formData.gender === option.value
                            ? 'bg-secondary border-secondary text-secondary-foreground'
                            : 'bg-background border-border hover:border-secondary/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Areas of Interest</Label>
                  <p className="text-sm text-muted-foreground mb-2">What domains interest you?</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                          formData.interests.includes(interest)
                            ? 'bg-secondary border-secondary text-secondary-foreground'
                            : 'bg-background border-border hover:border-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.interests.includes(interest) && <CheckCircle2 className="w-3 h-3" />}
                          {interest}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Work Style Preferences */}
              <div className="space-y-4">
                <WorkStyleSelector 
                  workStyle={formData.workStyle} 
                  onChange={(workStyle) => setFormData({ ...formData, workStyle })} 
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Social Links & Portfolio
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="github">GitHub Profile</Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio Website</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  />
                </div>
              </div>

              {/* Bio & Availability */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About You
                </h2>

                <div>
                  <Label htmlFor="bio">Bio *</Label>
                  <textarea
                    id="bio"
                    placeholder="Tell us about yourself, your background, and what you're passionate about (min 10 characters)"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                    rows={4}
                    className={`w-full px-3 py-2 bg-background border border-input rounded-md text-sm resize-none ${
                      errors.bio ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">{formData.bio.length}/500</p>
                    {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                  </div>
                </div>

                <div>
                  <Label>Available For Hackathons *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    {(['online', 'in-person', 'both'] as const).map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, availableFor: option })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-center capitalize ${
                          formData.availableFor === option
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                      >
                        {option === 'in-person' ? 'In-Person' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
