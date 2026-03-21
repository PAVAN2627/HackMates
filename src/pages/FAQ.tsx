import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is HackMates?',
        a: 'HackMates is India\'s hackathon community platform. You can discover hackathons, find teammates using AI-powered synergy matching, build your developer profile, and communicate with your team — all in one place.'
      },
      {
        q: 'Is HackMates free to use?',
        a: 'Yes, HackMates is completely free. Sign up with your Google account or email and start exploring hackathons and finding teammates right away.'
      },
      {
        q: 'Who can use HackMates?',
        a: 'Anyone — students, working professionals, designers, developers, or anyone passionate about hackathons. There are no separate organizer or participant roles; all users are equal on the platform.'
      },
    ]
  },
  {
    category: 'Teams & Hackathons',
    items: [
      {
        q: 'How do I create a team?',
        a: 'Go to a hackathon\'s detail page, scroll to the Teams section, and click "Create Team". Give your team a name and description. Anyone who has joined a hackathon can create a team for it.'
      },
      {
        q: 'How do I invite teammates?',
        a: 'Open your team from the hackathon details page, go to the Members tab, and use the search bar to find and invite other participants. You can also use the Recommended Profiles tab to get AI-suggested matches.'
      },
      {
        q: 'What are off-platform teams?',
        a: 'Off-platform teams are for hackathons not listed on HackMates. Go to Teams → Create Off-Platform Team, enter the hackathon name, and invite any HackMates user by searching their profile.'
      },
      {
        q: 'Can I join multiple hackathons?',
        a: 'Yes. You can join as many hackathons as you want and be part of different teams across them.'
      },
      {
        q: 'How do I leave a team?',
        a: 'Open the team from the hackathon details page, go to the Members tab, and click "Leave Team". If you are the team leader, you\'ll need to transfer leadership or disband the team first.'
      },
    ]
  },
  {
    category: 'Matching & Profiles',
    items: [
      {
        q: 'How does synergy matching work?',
        a: 'Our algorithm scores compatibility based on work style (structured vs flexible), goals (win vs learn), schedule preferences, commitment level, and skills. Complementary schedules (e.g., day owl + night owl) actually score higher than identical ones, since they cover more hours.'
      },
      {
        q: 'What is the reliability badge system?',
        a: 'After each hackathon, teammates rate each other. Based on your ratings and participation history, you earn one of four tiers: Newbie → Reliable → Finisher → Legend. Higher badges make it easier to get invited to teams.'
      },
      {
        q: 'How does mode filtering work?',
        a: 'When searching for teammates, profiles are filtered by hackathon mode. Online hackathons show online + "both" profiles. In-person shows in-person + "both". If a user selected "both" in their profile, they appear in all searches.'
      },
      {
        q: 'Can I update my profile after registering?',
        a: 'Yes. Go to Profile from the dashboard sidebar to update your skills, work style, schedule preference, commitment level, and avatar at any time.'
      },
    ]
  },
  {
    category: 'Communication',
    items: [
      {
        q: 'How do I message someone?',
        a: 'Go to Messages from the sidebar and start a direct conversation with any user. You can also click the message icon on a profile card to open a chat with them.'
      },
      {
        q: 'What are announcements?',
        a: 'Hackathon creators can post announcements to all participants. You\'ll see unread announcement counts in the sidebar and receive email notifications for important updates.'
      },
      {
        q: 'Is there a team chat?',
        a: 'Yes. Every team has a dedicated chat room accessible from the team details page. Only team members can see and send messages in the team chat.'
      },
    ]
  },
  {
    category: 'Account & Privacy',
    items: [
      {
        q: 'How do I delete my account?',
        a: 'Account deletion is currently handled by contacting us via Instagram or LinkedIn (@hackmates.tech). We\'ll process your request within 48 hours.'
      },
      {
        q: 'Is my data safe?',
        a: 'Yes. We use Firebase with strict security rules — users can only read/write their own data. We never sell your data to third parties. See our Privacy Policy for full details.'
      },
      {
        q: 'What data does HackMates collect?',
        a: 'We collect your name, email, profile information (skills, work style, etc.), and activity on the platform (teams joined, hackathons participated in). This is used solely to power the matching and communication features.'
      },
    ]
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Everything you need to know about HackMates.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-semibold text-purple-600 mb-3">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = openItems[key];
                  return (
                    <div
                      key={key}
                      className="bg-white/70 dark:bg-slate-800/70 rounded-xl border border-white/20 overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-slate-800 dark:text-slate-200 hover:text-purple-600 transition-colors"
                        onClick={() => toggle(key)}
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white/60 dark:bg-slate-800/60 rounded-2xl p-8 border border-white/20">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Still have questions?</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Reach us on Instagram or LinkedIn{' '}
            <a href="https://instagram.com/hackmates.tech" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">@hackmates.tech</a>
          </p>
        </div>
      </div>
    </div>
  );
}
