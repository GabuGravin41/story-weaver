
export enum Sender {
  User = 'user',
  AI = 'ai',
  System = 'system',
}

export interface Citation {
  title: string;
  author: string;
}

export interface Story {
  title: string;
  content: string;
  citation: Citation;
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  sender: Sender;
  content: string; // The raw text from the AI
  stories?: Story[]; // Parsed stories from the content
  sources?: Source[];
}

export type SearchMode = 'quick' | 'deep' | 'collab';

export type ViewMode = 'library' | 'scriptorium';
