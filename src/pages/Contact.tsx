import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.body) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    const bodyText = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.body}`;
    const mailtoUrl = `mailto:hackmates.tech@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-purple-600 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            Contact{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Have a question, feedback, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Social + Info */}
          <div className="md:col-span-2 space-y-4">
            <a
              href="https://instagram.com/hackmates.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 rounded-xl p-5 border border-white/20 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 transition-colors">Instagram</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">@hackmates.tech</p>
              </div>
            </a>

            <a
              href="https://linkedin.com/company/hackmates.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 rounded-xl p-5 border border-white/20 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center flex-shrink-0">
                <Linkedin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 transition-colors">LinkedIn</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">hackmates.tech</p>
              </div>
            </a>

            <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 rounded-xl p-5 border border-white/20">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Email</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">hackmates.tech@gmail.com</p>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                We typically respond within 24–48 hours. For urgent issues, Instagram DMs are the fastest way to reach us.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Arjun Sharma"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="e.g. Bug report, Feature request, General question"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    name="body"
                    placeholder="Write your message here..."
                    rows={6}
                    value={form.body}
                    onChange={handleChange}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <p className="text-xs text-center text-slate-400">
                  Opens your email app with the details pre-filled.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
