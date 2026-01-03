import React from 'react';
import { Message, Sender, SearchMode } from '../types';
import { UserIcon, SystemIcon, LinkIcon } from './icons';
import StoryCard from './StoryCard';

interface ChatMessageProps {
    message: Message;
    onSendMessage: (text: string, mode: SearchMode) => void;
}

const UserMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex items-start justify-end gap-3">
    <div className="bg-amber-500 text-white p-3 rounded-lg max-w-2xl">
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-amber-500 font-bold">
      <UserIcon className="w-6 h-6"/>
    </div>
  </div>
);

const AIMessage: React.FC<{ message: Message, onSendMessage: (text: string, mode: SearchMode) => void }> = ({ message, onSendMessage }) => {
    const hasStories = message.stories && message.stories.length > 0;

    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-amber-500 dark:text-amber-400 font-serif-display text-lg self-start mt-1">AI</div>
            <div className="bg-slate-200 dark:bg-slate-700/50 p-4 rounded-lg max-w-3xl flex-1">
                {hasStories ? (
                    <div className="flex flex-col gap-4">
                        {message.stories?.map((story, index) => (
                            <StoryCard key={index} story={story} onAction={onSendMessage} />
                        ))}
                    </div>
                ) : (
                   <div className="prose prose-slate dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-300">
                     <p className="whitespace-pre-wrap">{message.content}</p>
                   </div>
                )}

                {message.sources && message.sources.length > 0 && (
                    <div className="mt-6 border-t border-slate-300 dark:border-slate-600 pt-3">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sources</h4>
                        <div className="flex flex-col gap-2">
                        {message.sources.map((source, i) => (
                            <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-start gap-2 no-underline">
                                <LinkIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="truncate">{source.title}</span>
                            </a>
                        ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const SystemMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 justify-center">
    <SystemIcon className="w-4 h-4" />
    <p>{content}</p>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSendMessage }) => {
  switch (message.sender) {
    case Sender.User:
      return <UserMessage content={message.content} />;
    case Sender.AI:
      return <AIMessage message={message} onSendMessage={onSendMessage} />;
    case Sender.System:
      return <SystemMessage content={message.content} />;
    default:
      return null;
  }
};

export default ChatMessage;
