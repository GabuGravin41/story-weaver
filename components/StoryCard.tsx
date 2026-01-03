import React from 'react';
import { Story, SearchMode } from '../types';
import { DownloadIcon, InfoIcon, LayersIcon, SparklesIcon, FeatherIcon } from './icons';
import { generatePdf } from '../utils/pdfGenerator';

interface StoryCardProps {
    story: Story;
    onAction: (text: string, mode: SearchMode) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onAction }) => {

    const handleDownload = () => {
        generatePdf(story.title, story.content, story.citation);
    };

    const handleTellMeMore = () => {
        onAction(`Tell me a detailed summary of "${story.title}" from "${story.citation.title}" by ${story.citation.author}.`, 'quick');
    };

    const handleFindSimilar = () => {
        onAction(`Find stories with themes similar to "${story.title}".`, 'deep');
    };

    const handleAnalyze = () => {
        onAction(`Let's do a deep analysis of the themes and literary style of "${story.title}" by ${story.citation.author}. What are your initial thoughts?`, 'collab');
    };

    const actionButtonClass = "flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600/60 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-slate-800 focus:ring-amber-500";

    return (
        <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-300 dark:border-slate-700 shadow-md transition-colors">
            <div className="border-b border-slate-300 dark:border-slate-700 pb-3 mb-3">
                <h3 className="font-serif-display text-xl text-amber-600 dark:text-amber-400">{story.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">by {story.citation.author} in <em>{story.citation.title}</em></p>
            </div>
            
            <div className="prose prose-sm prose-slate dark:prose-invert max-h-48 overflow-y-auto mb-4 pr-2">
                <p className="whitespace-pre-wrap">{story.content}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-700">
                <button onClick={handleTellMeMore} className={actionButtonClass}>
                    <InfoIcon className="w-4 h-4" />
                    Tell Me More
                </button>
                 <button onClick={handleFindSimilar} className={actionButtonClass}>
                    <LayersIcon className="w-4 h-4" />
                    Find Similar
                    <SparklesIcon className="w-4 h-4 text-amber-500 -ml-1" />
                </button>
                <button onClick={handleAnalyze} className={actionButtonClass}>
                    <FeatherIcon className="w-4 h-4" />
                    Analyze with Me
                </button>
                <button onClick={handleDownload} className={`${actionButtonClass} ml-auto`}>
                    <DownloadIcon className="w-4 h-4" />
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default StoryCard;
