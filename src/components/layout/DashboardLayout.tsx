import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loading } from '@/components/Loading';
import { AIAssistant, AIAssistantButton } from '@/components/AIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAssistant } from '@/hooks/useAIAssistant';

export function DashboardLayout() {
  const { user, loading } = useAuth();
  const { isOpen, hasNewMessage, toggleAI, closeAI } = useAIAssistant();
  const location = useLocation();

  // Pages where chatbot should be hidden (Messages and Create Hackathon)
  const hideChatbotPages = ['/messages', '/create-hackathon'];
  const shouldHideChatbot = hideChatbotPages.some(page => location.pathname.startsWith(page));

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64 transition-all duration-300">
        <Header />
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      
      {/* AI Assistant - Hidden on Messages and Create Hackathon pages */}
      {!shouldHideChatbot && (
        <>
          <AIAssistant isOpen={isOpen} onToggle={toggleAI} onClose={closeAI} />
          {!isOpen && (
            <AIAssistantButton onClick={toggleAI} hasNewMessage={hasNewMessage} />
          )}
        </>
      )}
    </div>
  );
}
