
import React, { useRef, useEffect } from 'react';
import { useStoryChat } from '../hooks/useStoryChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { LoadingSpinner } from './LoadingSpinner';
import { Sender } from '../types';

const ChatWindow: React.FC = () => {
  const { messages, isLoading, sendMessage, clearHistory } = useStoryChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col flex-grow h-[calc(100vh-150px)] bg-slate-100 dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden transition-colors duration-300 relative">
      <button 
        onClick={clearHistory}
        className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-red-500 transition-colors"
        title="Clear Library History"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>

      <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onSendMessage={sendMessage} />
        ))}
        {isLoading && messages[messages.length - 1]?.sender === Sender.User && (
            <div className="flex items-center justify-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-amber-500 dark:text-amber-400 font-serif-display text-lg">AI</div>
                <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-slate-500 dark:text-slate-400 animate-pulse">Weaving your story...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-slate-200 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-700 transition-colors duration-300">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;
