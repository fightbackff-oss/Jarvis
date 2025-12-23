import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MoreHorizontal, Mic, StopCircle, Phone, Volume2, VolumeX, AlertCircle, Key } from 'lucide-react';
import { Gem, Message } from '../types';
import { GemIcon } from './GemIcon';
import { geminiService } from '../services/geminiService';
import { CodeBlock } from './CodeBlock';

interface ChatAreaProps {
  gem: Gem;
  initialMessages: Message[];
  onUpdateMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  onBack: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ gem, initialMessages, onUpdateMessages, onBack }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const originalInputRef = useRef('');

  useEffect(() => {
    setIsVoiceMode(false);
    setAuthError(false);
  }, [gem.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [initialMessages, isLoading, authError]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  const handleConnectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setAuthError(false);
      } catch (e) {
        console.error("Failed to select key", e);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setAuthError(false);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...initialMessages, userMsg];
    onUpdateMessages(newMessages);
    
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    onUpdateMessages([...newMessages, modelMsg]);

    try {
      let messageToSend = text;
      if (isVoiceMode) {
        messageToSend += " [SYSTEM INSTRUCTION: VOICE MODE ACTIVE. Respond using short, spoken-style sentences.]";
      }

      const stream = geminiService.sendMessageStream(messageToSend, gem.systemInstruction, initialMessages);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        onUpdateMessages((prev: Message[]) => 
          prev.map(msg => msg.id === modelMsgId ? { ...msg, content: fullContent } : msg)
        );
      }
      
      onUpdateMessages((prev: Message[]) => 
        prev.map(msg => msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg)
      );

    } catch (error: any) {
      console.error("Failed to send message", error);
      
      if (error.message === "AUTH_ERROR") {
        setAuthError(true);
      }

      onUpdateMessages((prev: Message[]) => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, content: "Connection failed. Please check your API key settings.", isStreaming: false } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\w-]*\s*[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```([\w-]*)\s*([\s\S]*?)```/);
        if (match) {
          const language = match[1].trim();
          const code = match[2].trim();
          return <CodeBlock key={index} language={language} code={code} />;
        }
      }
      return <span key={index} className="whitespace-pre-wrap break-words">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 md:rounded-2xl shadow-none md:shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 ml-1">
             <div className={`p-1.5 rounded-full bg-${gem.color}-100 text-${gem.color}-600`}>
               <GemIcon icon={gem.icon} className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
               <h2 className="font-semibold text-slate-800 text-sm leading-tight">{gem.name}</h2>
               <p className="text-[10px] text-slate-400 font-medium">Assistant</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`p-2 rounded-full transition-all ${isVoiceMode ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4 space-y-6">
        {initialMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-[fadeIn_0.5s_ease-out]">
            <div className={`p-5 rounded-3xl bg-${gem.color}-100 mb-6 shadow-sm`}>
              <GemIcon icon={gem.icon} className={`w-10 h-10 text-${gem.color}-600`} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hello there!</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">{gem.description}</p>
            <div className="w-full max-w-sm space-y-2">
              {gem.starterPrompts.map((prompt, idx) => (
                <button key={idx} onClick={() => handleSendMessage(prompt)} className="w-full p-3.5 text-sm text-left bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm active:scale-[0.98] transition-all hover:border-indigo-300">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {initialMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
            {msg.role === 'model' && (
              <div className={`w-8 h-8 rounded-full bg-${gem.color}-100 text-${gem.color}-600 flex items-center justify-center mr-2 self-end mb-1 shrink-0`}>
                <GemIcon icon={gem.icon} className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-[15px] shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
              {msg.role === 'model' ? renderContent(msg.content) : msg.content}
              {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-slate-300 animate-pulse" />}
            </div>
          </div>
        ))}

        {authError && (
          <div className="flex flex-col items-center p-6 bg-red-50 border border-red-100 rounded-2xl text-center space-y-3 animate-[fadeIn_0.3s_ease-out]">
             <AlertCircle className="w-8 h-8 text-red-500" />
             <div className="space-y-1">
                <p className="font-bold text-red-900">API Key Missing or Expired</p>
                <p className="text-xs text-red-600">You need to select a valid API key from Google AI Studio to use the {gem.name} assistant.</p>
             </div>
             <button 
               onClick={handleConnectKey}
               className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-red-700 active:scale-95 transition-all"
             >
               <Key className="w-4 h-4" />
               Connect API Key
             </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-3 z-10 pb-safe">
        <div className={`flex items-end gap-2 bg-slate-100/50 p-1.5 rounded-[24px] border transition-all duration-300 border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:shadow-md`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 px-3 text-slate-800 placeholder-slate-400 text-[16px]"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-full flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};