import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { sendWelcomeEmail, sendTeamAdditionEmail } from '@/lib/emailService';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';

export default function EmailTest() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleTestWelcomeEmail = async () => {
    if (!email || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await sendWelcomeEmail(email, name, 'TestPassword123');
      
      if (response.success) {
        setResult({ type: 'success', message: 'Email sent successfully! Check your inbox.' });
        toast.success('Email sent! Check your inbox (may take 10-30 seconds)');
      } else {
        setResult({ type: 'error', message: 'Failed to send email. Check console for details.' });
        toast.error('Failed to send email');
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Error sending email. Check console.' });
      toast.error('Error sending email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTeamEmail = async () => {
    if (!email || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await sendTeamAdditionEmail(
        email,
        name,
        'Test Hackathon 2025',
        'Team Awesome',
        'Pavan Mali',
        'test-hackathon-id'
      );
      
      if (response.success) {
        setResult({ type: 'success', message: 'Team invite email sent! Check your inbox.' });
        toast.success('Email sent! Check your inbox (may take 10-30 seconds)');
      } else {
        setResult({ type: 'error', message: 'Failed to send email. Check console for details.' });
        toast.error('Failed to send email');
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Error sending email. Check console.' });
      toast.error('Error sending email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Email Test Page
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Test Google Apps Script email sending
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Test Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com or your.email+test@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Tip: Use Gmail's + trick (e.g., yourname+test@gmail.com) to test without a second email
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleTestWelcomeEmail}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Test Welcome Email'}
              </Button>

              <Button
                onClick={handleTestTeamEmail}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Test Team Invite'}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border-2 ${
                result.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  {result.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <p className="font-medium">{result.message}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📝 Testing Instructions:</h3>
              <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Enter your name and email address</li>
                <li>Click one of the test buttons</li>
                <li>Wait 10-30 seconds for email delivery</li>
                <li>Check your inbox (and spam folder)</li>
                <li>Verify the email content looks good</li>
              </ol>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Important Notes:</h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1 list-disc list-inside">
                <li>Using mode: "no-cors" means we can't see the response</li>
                <li>Email will be sent even if we show "success" immediately</li>
                <li>Check browser console for any errors</li>
                <li>Gmail may take 10-30 seconds to deliver</li>
                <li>Check spam folder if not in inbox</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <a 
            href="/hackathons" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Hackathons
          </a>
        </div>
      </div>
    </div>
  );
}
