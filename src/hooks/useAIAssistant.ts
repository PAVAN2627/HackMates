import { useState, useEffect } from 'react';

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Check if user has seen the AI assistant before
  useEffect(() => {
    const hasSeenAI = localStorage.getItem('hackmates_ai_seen');
    if (!hasSeenAI) {
      setHasNewMessage(true);
      // Show a subtle notification that AI is available
      setTimeout(() => {
        if (!isOpen) {
          setHasNewMessage(true);
        }
      }, 5000); // Show after 5 seconds
    }
  }, [isOpen]);

  const toggleAI = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      localStorage.setItem('hackmates_ai_seen', 'true');
    }
  };

  const closeAI = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    hasNewMessage,
    toggleAI,
    closeAI
  };
}