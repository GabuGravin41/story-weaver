import React, { useState, useRef, KeyboardEvent } from 'react';
import { SendIcon, SparklesIcon, FeatherIcon } from './icons';
import { SearchMode } from '../types';

interface ChatInputProps {
  onSend: (text: string, mode: SearchMode) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<SearchMode>('quick');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text, mode);
      setText('');
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
      const textarea = textareaRef.current;
      if (textarea) {
          textarea.style.height = 'auto';
          const scrollHeight = textarea.scrollHeight;
          textarea.style.height = `${scrollHeight}px`;
      }
  };
  
  // Fix: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  const modeOptions: { id: SearchMode; label: string; icon: React.ReactNode }[] = [
    { id: 'quick', label: 'Quick Answer', icon: <SendIcon className="w-4 h-4" /> },
    { id: 'deep', label: 'Deep Dive', icon: <SparklesIcon className="w-4 h-4" /> },
    { id: 'collab', label: 'Creative Collab', icon: <FeatherIcon className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-2 pr-3 border border-slate-300 dark:border-slate-700 focus-within:border-amber-500 dark:focus-within:border-amber-400 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          placeholder="Ask for a story, e.g., 'The Emperor's New Clothes'..."
          className="flex-grow bg-transparent focus:outline-none resize-none p-2 max-h-40 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          className="p-3 rounded-md bg-amber-500 text-white disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 hover:bg-amber-600 dark:hover:bg-amber-400 transition-colors self-end"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center justify-center sm:justify-end" aria-label="Select search mode">
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700/50 p-1 rounded-lg">
            {modeOptions.map(option => (
                <button
                    key={option.id}
                    onClick={() => setMode(option.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 
                        ${mode === option.id 
                            ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm' 
                            : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-600/50'}`
                    }
                    aria-pressed={mode === option.id}
                >
                    {option.icon}
                    <span className="hidden sm:inline">{option.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;