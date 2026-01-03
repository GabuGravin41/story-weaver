
import { useState, useCallback, useEffect } from 'react';
import { Message, Sender, SearchMode } from '../types';
import { getQuickAnswer, getDeepAnalysis, getCreativeCollab } from '../services/geminiService';

const STORAGE_KEY = 'story_weaver_library_messages';

export const useStoryChat = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved library messages", e);
      }
    }
    return [
      {
        id: 'init',
        sender: Sender.System,
        content: 'Welcome to the Story Weaver\'s archive. How can I help you? Ask for a specific story, or describe a theme you wish to explore.'
      }
    ];
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback(async (text: string, mode: SearchMode) => {
    if (isLoading || !text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: Sender.User,
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let result;
      switch (mode) {
        case 'deep':
          result = await getDeepAnalysis(text);
          break;
        case 'collab':
          result = await getCreativeCollab(text);
          break;
        case 'quick':
        default:
          result = await getQuickAnswer(text);
          break;
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: Sender.AI,
        content: result.text,
        stories: result.stories,
        sources: result.sources,
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: Sender.System,
        content: 'There was an error processing your request. Please check the console and try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: 'init',
        sender: Sender.System,
        content: 'Archives cleared. How can I help you today?'
      }
    ]);
  }, []);

  return { messages, isLoading, sendMessage, clearHistory };
};
