import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, MapPin, BookOpen, Tag, MessageSquare, CheckCircle2, Upload, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

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

const locationOptions = [
  'Online', 'Bangalore', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad', 
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Indore',
  'Chandigarh', 'Lucknow', 'Nagpur', 'Bhopal', 'Coimbatore', 'Other'
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
  'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Social Impact'
];

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().min(2, 'College name is required'),
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
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    location: '',
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
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (user) {
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
      
      setAvatarFile(file);
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
    setAvatarFile(null);
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validation = registrationSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the errors below');
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        toast.error('Passwords do not match');
        setIsSubmitting(false);
        return;
      }

      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        college: formData.college,
        location: formData.location,
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
        lookingForTeam: true,
      });

      toast.success('Account created successfully!');
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
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

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
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    >
                      <option value="">Select location</option>
                      {locationOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
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
