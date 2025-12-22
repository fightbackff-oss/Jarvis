import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MoreHorizontal, Sparkles, Mic, MicOff, Volume2, VolumeX, StopCircle, Phone } from 'lucide-react';
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
  
  // Voice Output Mode (Jarvis Style)
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // Dictation State
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const originalInputRef = useRef('');

  // Start chat session with history when gem changes
  useEffect(() => {
    setIsVoiceMode(false);
    // Initialize service with existing history
    geminiService.startChat(gem.id, gem.systemInstruction, initialMessages);
  }, [gem.id, gem.systemInstruction]); // Removed initialMessages dependency to prevent reset loop

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [initialMessages, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  // Command Parser Effect
  useEffect(() => {
    const lastMsg = initialMessages[initialMessages.length - 1];
    if (lastMsg && lastMsg.role === 'model' && !lastMsg.isStreaming) {
      const callCommandRegex = /\[\[CMD:CALL\|(.*?)\]\]/;
      const match = lastMsg.content.match(callCommandRegex);
      
      if (match) {
        const target = match[1];
        console.log(`Executing Call Command for: ${target}`);
        
        const cleanContent = lastMsg.content.replace(callCommandRegex, '').trim();
        const updatedMessages = initialMessages.map(m => m.id === lastMsg.id ? { ...m, content: cleanContent } : m);
        
        onUpdateMessages(updatedMessages);

        setTimeout(() => {
           window.location.href = `tel:${target}`;
        }, 800);
      }
    }
  }, [initialMessages, onUpdateMessages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
               finalTranscript += event.results[i][0].transcript;
            } else {
               interimTranscript += event.results[i][0].transcript;
            }
          }
          
          const spacer = originalInputRef.current && !originalInputRef.current.endsWith(' ') ? ' ' : '';
          const currentText = finalTranscript || interimTranscript;
          
          if (currentText) {
             setInput(originalInputRef.current + spacer + currentText);
          }
          
          if (finalTranscript) {
             originalInputRef.current = originalInputRef.current + spacer + finalTranscript;
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        
        recognition.onend = () => {
           setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      originalInputRef.current = input;
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start recording:", e);
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Optimistic update
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

    // Add placeholder model message
    onUpdateMessages([...newMessages, modelMsg]);

    try {
      let messageToSend = text;
      if (isVoiceMode) {
        messageToSend += " [SYSTEM INSTRUCTION: VOICE MODE ACTIVE. Respond using short, spoken-style sentences. Be concise. No markdown formatting.]";
      }

      const stream = geminiService.sendMessageStream(messageToSend);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        // Update streaming message
        onUpdateMessages((prev: Message[]) => 
          prev.map(msg => 
            msg.id === modelMsgId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        );
      }
      
      // Finalize message
      onUpdateMessages((prev: Message[]) => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to send message", error);
      onUpdateMessages((prev: Message[]) => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isStreaming: false } 
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

  // --- Content Parser ---
  const renderContent = (content: string) => {
    // Basic regex to split code blocks: ```lang ... ```
    // We capture the language identifier (group 1) and the code (group 2)
    // The split logic will produce array items.
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
      
      // Render regular text with markdown-like paragraph handling
      // For a "world-class" feel, we could use a real markdown parser, 
      // but splitting by double newline for paragraphs is a robust lightweight start.
      return (
         <span key={index} className="whitespace-pre-wrap break-words">{part}</span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 md:rounded-2xl shadow-none md:shadow-xl overflow-hidden relative">
      
      {/* App Bar / Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full active:scale-95 transition-transform"
          >
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
            className={`p-2 rounded-full transition-all duration-300 ${isVoiceMode ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
            title={isVoiceMode ? "Voice Output Mode: ON" : "Voice Output Mode: OFF"}
          >
            {isVoiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4 space-y-6">
        {initialMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className={`p-5 rounded-3xl bg-${gem.color}-100 mb-6 shadow-sm`}>
              <GemIcon icon={gem.icon} className={`w-10 h-10 text-${gem.color}-600`} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hello there!</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">{gem.description}</p>
            
            <div className="w-full max-w-sm space-y-2">
              {gem.starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full p-3.5 text-sm text-left bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm active:scale-[0.98] transition-all hover:border-indigo-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {initialMessages.map((msg) => {
          const isCallAction = msg.role === 'model' && (msg.content.includes("Calling") || msg.content.includes("Dialing"));

          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}
            >
              {msg.role === 'model' && (
                <div className={`w-8 h-8 rounded-full bg-${gem.color}-100 text-${gem.color}-600 flex items-center justify-center mr-2 self-end mb-1 shadow-sm shrink-0`}>
                  <GemIcon icon={gem.icon} className="w-4 h-4" />
                </div>
              )}
              
              <div
                className={`
                  max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm overflow-hidden
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none' 
                    : isCallAction 
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-bl-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}
                `}
              >
                {isCallAction && (
                   <div className="flex items-center gap-2 mb-2 text-emerald-600 font-semibold text-xs uppercase tracking-wide">
                      <Phone className="w-3.5 h-3.5 animate-pulse" />
                      <span>Action Triggered</span>
                   </div>
                )}
                
                {msg.role === 'model' ? renderContent(msg.content) : msg.content}
                
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-slate-300 animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-3 z-10 pb-safe">
        <div className={`
          flex items-end gap-2 bg-slate-100/50 p-1.5 rounded-[24px] border transition-all duration-300
          ${isVoiceMode ? 'ring-2 ring-indigo-500/10' : ''}
          ${isRecording ? 'border-red-400 bg-red-50/50 shadow-md' : 'border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:shadow-md'}
        `}>
          <div className="p-1">
             <button 
                onClick={toggleRecording}
                className={`
                  p-2 rounded-full transition-all duration-300
                  ${isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-md hover:bg-red-600' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}
                `}
                title={isRecording ? "Stop Recording" : "Start Dictation"}
             >
                {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
             </button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Type a message..."}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 px-0 text-slate-800 placeholder-slate-400 text-[16px]"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className={`
              p-2.5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0
              ${input.trim() && !isLoading 
                ? 'bg-indigo-600 text-white shadow-md hover:scale-105 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
      
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};