import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-purple-600 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            Privacy{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Last updated: March 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed mb-3">When you use HackMates, we collect the following information:</p>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Account information: name, email address, and profile photo (from Google Sign-In or manual registration)</li>
              <li>Profile data: skills, work style preferences, schedule, commitment level, and bio that you provide</li>
              <li>Activity data: hackathons joined, teams created or joined, messages sent, and announcements read</li>
              <li>Technical data: browser type, device type, and usage patterns for performance monitoring</li>
            </ul>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">2. How We Use Your Information</h2>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>To power the synergy matching algorithm and recommend compatible teammates</li>
              <li>To display your profile to other users searching for team members</li>
              <li>To send email notifications for team invites, announcements, and platform updates</li>
              <li>To calculate and display your reliability badge based on peer feedback</li>
              <li>To improve platform features and fix bugs</li>
            </ul>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">3. Data Storage & Security</h2>
            <p className="text-sm leading-relaxed">
              Your data is stored securely using Google Firebase (Firestore and Firebase Authentication). 
              We enforce strict Firestore security rules — users can only access their own private data. 
              Public profile information (name, skills, badges) is visible to other authenticated users 
              to enable team discovery. We do not store passwords — authentication is handled by Google 
              or Firebase Auth.
            </p>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">4. Data Sharing</h2>
            <p className="text-sm leading-relaxed">
              We do not sell, rent, or share your personal data with third parties for marketing purposes. 
              Your data may be processed by the following services as part of platform operation:
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside mt-3">
              <li>Google Firebase — database, authentication, and push notifications</li>
              <li>Google Gemini AI — AI assistant responses (no personal data is sent, only your chat messages)</li>
              <li>Google Apps Script — email delivery for notifications</li>
            </ul>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">5. Your Rights</h2>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Access: You can view all your profile data from the Profile page at any time</li>
              <li>Update: You can edit your profile information at any time</li>
              <li>Delete: You can request account deletion by contacting us at @hackmates.tech on Instagram or LinkedIn</li>
              <li>Opt-out: You can disable push notifications from your browser settings at any time</li>
            </ul>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">6. Cookies</h2>
            <p className="text-sm leading-relaxed">
              HackMates uses minimal cookies — primarily for Firebase authentication session management. 
              We do not use advertising or tracking cookies.
            </p>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">7. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy as the platform evolves. Significant changes will be 
              communicated via platform announcements. Continued use of HackMates after changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">8. Contact</h2>
            <p className="text-sm leading-relaxed">
              For any privacy-related questions or data deletion requests, reach us at:
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p>Instagram: <a href="https://instagram.com/hackmates.tech" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">@hackmates.tech</a></p>
              <p>LinkedIn: <a href="https://linkedin.com/company/hackmates.tech" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">hackmates.tech</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
