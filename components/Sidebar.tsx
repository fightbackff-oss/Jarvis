import React, { useEffect, useState } from 'react';
import { Home, MessageSquare, UserCircle, Key } from 'lucide-react';

interface SidebarProps {
  onGoHome: () => void;
  onGoChats: () => void;
  onGoProfile: () => void;
  activeView: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onGoHome,
  onGoChats,
  onGoProfile,
  activeView,
}) => {
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    // Check if running in an environment that supports dynamic key selection
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const checkKey = async () => {
        try {
           const hasKey = await (window as any).aistudio.hasSelectedApiKey();
           setNeedsApiKey(!hasKey);
        } catch (e) {
          console.log("AI Studio check skipped");
        }
      };
      checkKey();
    }
  }, []);

  const handleConnectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setNeedsApiKey(false);
      } catch (e) {
        console.error("Failed to select key", e);
      }
    }
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
         <span className="text-2xl">💎</span>
         <span className="text-xl font-bold text-slate-800 tracking-tight">Gemini Gems</span>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        <button
          onClick={onGoHome}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeView === 'gallery'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${activeView === 'gallery' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Home</span>
        </button>
        
        <button
          onClick={onGoChats}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeView === 'recents'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeView === 'recents' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Chats</span>
        </button>

        <button
          onClick={onGoProfile}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeView === 'profile'
              ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <UserCircle className={`w-5 h-5 ${activeView === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Profile</span>
        </button>
      </div>

      <div className="p-6 space-y-4">
        {needsApiKey && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 animate-[fadeIn_0.5s_ease-out]">
             <h3 className="font-bold text-sm text-amber-800 mb-1">API Key Required</h3>
             <p className="text-xs text-amber-600 mb-3 leading-relaxed">Connect your Google AI Studio key to start chatting.</p>
             <button 
               onClick={handleConnectKey}
               className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
             >
               <Key className="w-3 h-3" />
               Connect Key
             </button>
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
           <h3 className="font-bold text-sm mb-1">Go Pro</h3>
           <p className="text-xs text-indigo-100 mb-3 opacity-90">Unlock advanced models and unlimited history.</p>
           <button className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">
             Upgrade Plan
           </button>
        </div>
      </div>
    </div>
  );
};