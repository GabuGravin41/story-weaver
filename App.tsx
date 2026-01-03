
import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import Scriptorium from './components/Scriptorium';
import { BookIcon, FeatherIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('story_weaver_view_mode');
    return (saved as ViewMode) || 'library';
  });

  useEffect(() => {
    localStorage.setItem('story_weaver_view_mode', viewMode);
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
      <header className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <BookIcon className="w-8 h-8 text-amber-500" />
                <h1 className="text-2xl font-bold text-amber-500 dark:text-amber-400 font-serif-display hidden md:block">Story Weaver AI</h1>
            </div>
            
            <nav className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 ml-4">
                <button 
                    onClick={() => setViewMode('library')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'library' 
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    Library
                </button>
                <button 
                    onClick={() => setViewMode('scriptorium')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'scriptorium' 
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <FeatherIcon className="w-4 h-4" />
                    Scriptorium
                </button>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-80px)]">
        {viewMode === 'library' ? <ChatWindow /> : <Scriptorium />}
      </main>
    </div>
  );
};

export default App;
