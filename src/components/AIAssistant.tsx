import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { hackMatesAI, ChatMessage } from '@/lib/geminiAI';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function AIAssistant({ isOpen, onToggle, onClose }: AIAssistantProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when component opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: profile 
          ? `👋 Hi ${profile.name}! I'm your HackMates AI Assistant! I can see you're skilled in ${profile.skills.slice(0, 3).join(', ')}${profile.skills.length > 3 ? ' and more' : ''}. I'm here to help you succeed in hackathons with personalized advice!

🤔 **Ask me about:**
• Personalized project ideas based on your skills
• Finding teammates with complementary skills
• Technical guidance for your projects
• Pitching & presentation tips
• Time management strategies

What would you like to know?`
          : "👋 Hi! I'm your HackMates AI Assistant! I'm here to help you succeed in hackathons. Ask me about team formation, project ideas, technical guidance, or anything hackathon-related!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, profile]);

  // Set user profile when it's available
  useEffect(() => {
    if (profile) {
      hackMatesAI.setUserProfile(profile);
    }
  }, [profile]);

  // Clear messages when chat is closed
  const handleClose = () => {
    setMessages([]);
    setInputMessage('');
    setIsMinimized(false);
    onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await hackMatesAI.generateResponse(userMessage.content, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "🚫 Sorry, I encountered an error generating a response. Please make sure the Gemini API key is configured correctly and try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResponse = (question: string) => {
    setInputMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = hackMatesAI.getQuickResponses();

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={cn(
        "bg-background border shadow-xl transition-all duration-300 flex flex-col",
        // Mobile: Full width with margins, Desktop: Fixed width
        "w-[calc(100vw-2rem)] max-w-sm md:w-80 md:max-w-96",
        isMinimized ? "h-14" : "h-[70vh] max-h-[500px] md:h-[500px]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-2 md:p-3 border-b bg-primary/5 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-xs md:text-sm">HackMates AI Assistant</h3>
              <p className="text-xs text-muted-foreground hidden md:block">Your hackathon mentor 🤖</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 md:h-7 md:w-7 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 md:h-7 md:w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[90%] md:max-w-[85%] rounded-lg px-2 md:px-3 py-2 text-xs md:text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                    )}
                    <div 
                      className="whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                          .replace(/^\s*\*\s+/gm, '• ')
                          .replace(/^\s*-\s+/gm, '• ')
                      }}
                    />
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-2 md:px-3 py-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="h-3 w-3" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Responses */}
            {messages.length <= 1 && (
              <div className="px-2 md:px-3 py-2 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-col gap-1">
                  {quickResponses.slice(0, 2).map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickResponse(item.response)}
                      className="text-xs h-7 md:h-8 justify-start"
                    >
                      {item.question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-2 md:p-3 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="text-xs md:text-sm flex-1 h-8 md:h-9"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-2 md:px-3 shrink-0 h-8 md:h-9"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// Floating AI Assistant Button
interface AIAssistantButtonProps {
  onClick: () => void;
  hasNewMessage?: boolean;
}

export function AIAssistantButton({ onClick, hasNewMessage = false }: AIAssistantButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 z-40"
      size="sm"
    >
      <div className="relative">
        <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
        {hasNewMessage && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
        <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-yellow-300 animate-pulse" />
      </div>
    </Button>
  );
}