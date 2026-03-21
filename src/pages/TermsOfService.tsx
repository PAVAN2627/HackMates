import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
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
            Terms of{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Last updated: March 2026</p>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300">

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By creating an account or using HackMates ("the platform"), you agree to these Terms of Service. 
              If you do not agree, please do not use the platform.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">2. Eligibility</h2>
            <p className="text-sm leading-relaxed">
              HackMates is open to anyone interested in hackathons — students, professionals, designers, 
              developers, and creators. You must be at least 13 years old to create an account. By using 
              the platform, you confirm that the information you provide is accurate.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">3. User Conduct</h2>
            <p className="text-sm leading-relaxed mb-3">You agree not to:</p>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Post false, misleading, or fraudulent information on your profile or hackathon listings</li>
              <li>Harass, threaten, or abuse other users through messages or any platform feature</li>
              <li>Spam other users with unsolicited messages or invitations</li>
              <li>Attempt to access other users' private data or circumvent security measures</li>
              <li>Use the platform for any illegal activity</li>
              <li>Create multiple accounts to manipulate reliability scores or ratings</li>
            </ul>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">4. Hackathon Listings</h2>
            <p className="text-sm leading-relaxed">
              Users who post hackathon listings are responsible for the accuracy of the information provided, 
              including dates, prizes, eligibility, and requirements. HackMates does not verify or endorse 
              any hackathon listed on the platform. Participants should independently verify hackathon details 
              before registering.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">5. Team & Feedback System</h2>
            <p className="text-sm leading-relaxed">
              The reliability badge and feedback system is based on peer ratings after hackathons. 
              Ratings must be honest and based on actual collaboration experience. Submitting false 
              ratings to manipulate scores is a violation of these terms and may result in account suspension.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">6. Intellectual Property</h2>
            <p className="text-sm leading-relaxed">
              HackMates and its logo are the property of hackmates.tech. You retain ownership of any 
              content you post (profile info, messages, etc.). By posting content, you grant HackMates 
              a non-exclusive license to display it to other users as part of the platform's functionality.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-sm leading-relaxed">
              HackMates is provided "as is" without warranties of any kind. We do not guarantee that 
              the platform will be uninterrupted, error-free, or that team matches will result in 
              successful hackathon outcomes. Use the platform at your own discretion.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">8. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              HackMates is not liable for any disputes between users, team conflicts, hackathon 
              outcomes, or any indirect damages arising from use of the platform. We are not 
              responsible for the actions of other users.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">9. Account Termination</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms. 
              You may request account deletion at any time by contacting us at @hackmates.tech.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">10. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We may update these terms as the platform grows. Continued use after changes 
              constitutes acceptance. We'll notify users of significant changes via platform announcements.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">11. Contact</h2>
            <p className="text-sm leading-relaxed">For questions about these terms:</p>
            <div className="mt-3 space-y-1 text-sm">
              <p>Instagram: <a href="https://instagram.com/hackmates.tech" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">@hackmates.tech</a></p>
              <p>LinkedIn: <a href="https://linkedin.com/company/hackmates.tech" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">hackmates.tech</a></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
