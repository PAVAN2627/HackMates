import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/Loading';
import { MobileDebugInfo } from '@/components/MobileDebugInfo';
import { GoogleLoginTroubleshooting } from '@/components/GoogleLoginTroubleshooting';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function Auth() {
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/hackathons" replace />;
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      console.log('Starting Google sign-in process...');
      await signInWithGoogle();
      toast.success('Welcome back to HackMates!');
      navigate('/hackathons');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.message === 'REDIRECT_TO_REGISTER') {
        // Store flag to indicate this is a Google signup (not login)
        localStorage.setItem('signupMethod', 'google');
        sessionStorage.setItem('signupMethod', 'google');
        toast.success('Welcome to HackMates! Please complete your profile to get started.');
        navigate('/register');
      } else {
        // Show user-friendly error messages
        let errorMessage = 'Failed to sign in with Google';
        
        if (error.message.includes('Pop-up was blocked')) {
          errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
        } else if (error.message.includes('cancelled')) {
          errorMessage = 'Sign-in was cancelled';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('not properly configured')) {
          errorMessage = 'Google Sign-In is not available. Please try email sign-in.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    try {
      console.log('Starting Google sign-up process...');
      // Store flag to indicate this is a Google signup
      localStorage.setItem('signupMethod', 'google');
      sessionStorage.setItem('signupMethod', 'google');
      await signInWithGoogle();
      toast.success('Welcome back to HackMates!');
      navigate('/hackathons');
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      
      if (error.message === 'REDIRECT_TO_REGISTER') {
        // This is expected for new users
        toast.success('Welcome to HackMates! Please complete your profile.');
        navigate('/register');
      } else {
        // Show user-friendly error messages
        let errorMessage = 'Failed to sign up with Google';
        
        if (error.message.includes('Pop-up was blocked')) {
          errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
        } else if (error.message.includes('cancelled')) {
          errorMessage = 'Sign-up was cancelled';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('not properly configured')) {
          errorMessage = 'Google Sign-In is not available. Please try email sign-up.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
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
      if (isLogin) {
        const validation = loginSchema.safeParse(formData);
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          return;
        }

        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/hackathons');
      } else {
        // Redirect to email signup form
        sessionStorage.setItem('signupMethod', 'email');
        navigate('/register');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Debug component for mobile testing */}
      <MobileDebugInfo />
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/assets/roundlogohackmates.png" 
              alt="HackMates Logo" 
              className="h-14 w-14 rounded-full"
            />
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">HackMates</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-center mb-4">
            Discover. <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Connect.</span> Collaborate.
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-md">
            Find amazing hackathons, discover team members, and build the future together.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-4">Developed by NoobcodersIND</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <img 
              src="/assets/roundlogohackmates.png" 
              alt="HackMates Logo" 
              className="h-10 w-10 rounded-full"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</span>
          </Link>

          {/* Back to home link */}
          <Link to="/" className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to Home</span>
          </Link>

          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Choose your sign up method'}
            </p>

            {/* LOGIN SECTION */}
            {isLogin ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-[48px] touch-manipulation"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="ml-2">Continue with Google</span>
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full min-h-[48px] touch-manipulation"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* SIGNUP SECTION - Choose method */
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* Google Signup Option */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2 min-h-[64px] touch-manipulation"
                    onClick={handleGoogleSignUp}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <div className="text-center">
                          <p className="font-medium">Signing up...</p>
                          <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <GoogleIcon />
                        <div className="text-center">
                          <p className="font-medium">Sign up with Google</p>
                          <p className="text-xs text-muted-foreground mt-1">No password needed</p>
                        </div>
                      </>
                    )}
                  </Button>

                  {/* Email & Password Signup Option */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2 min-h-[64px] touch-manipulation"
                    onClick={() => {
                      sessionStorage.setItem('signupMethod', 'email');
                      navigate('/register');
                    }}
                    disabled={isSubmitting}
                  >
                    <Mail className="h-5 w-5" />
                    <div className="text-center">
                      <p className="font-medium">Sign up with Email</p>
                      <p className="text-xs text-muted-foreground mt-1">Create password</p>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-primary hover:underline font-medium"
                  disabled={isSubmitting}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
            
            {/* Troubleshooting component */}
            <div className="mt-4 flex justify-center">
              <GoogleLoginTroubleshooting />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
