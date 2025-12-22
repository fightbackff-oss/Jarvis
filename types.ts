export interface Gem {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: 'brain' | 'briefcase' | 'code' | 'sparkles' | 'book' | 'heart' | 'music' | 'bot';
  color: string; // Tailwind color class prefix, e.g., 'purple', 'blue'
  starterPrompts: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export type ViewMode = 'gallery' | 'chat' | 'recents' | 'profile';

export interface ChatSession {
  gemId: string;
  messages: Message[];
}