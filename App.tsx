import React, { useState, useMemo } from 'react';
import { Home, UserCircle, MessageSquare, Plus } from 'lucide-react';
import { Gem, ViewMode, Message } from './types';
import { INITIAL_GEMS } from './constants';
import { Sidebar } from './components/Sidebar';
import { GemCard } from './components/GemCard';
import { ChatArea } from './components/ChatArea';
import { RecentChats } from './components/RecentChats';
import { CreateGemModal } from './components/CreateGemModal';
import { ProfileSection } from './components/ProfileSection';

function App() {
  const [gems, setGems] = useState<Gem[]>(INITIAL_GEMS);
  const [activeGem, setActiveGem] = useState<Gem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Global Session State
  const [sessions, setSessions] = useState<Record<string, Message[]>>({});

  const handleSelectGem = (gem: Gem) => {
    setActiveGem(gem);
    setViewMode('chat');
  };

  const handleGoHome = () => {
    setActiveGem(null);
    setViewMode('gallery');
  };
  
  const handleGoChats = () => {
    setActiveGem(null);
    setViewMode('recents');
  };
  
  const handleGoProfile = () => {
    setActiveGem(null);
    setViewMode('profile');
  };

  const handleCreateGem = (newGem: Gem) => {
    setGems(prev => [newGem, ...prev]);
    setActiveGem(newGem);
    setViewMode('chat');
  };

  const handleUpdateMessages = (messages: Message[] | ((prev: Message[]) => Message[])) => {
    if (!activeGem) return;
    
    setSessions(prevSessions => {
      const currentMessages = prevSessions[activeGem.id] || [];
      const newMessages = typeof messages === 'function' ? messages(currentMessages) : messages;
      return {
        ...prevSessions,
        [activeGem.id]: newMessages
      };
    });
  };

  // Determine which navigation item is active
  const activeNav = useMemo(() => {
    if (viewMode === 'chat') return 'recents'; // Chat implies we are in a session, map to chats or gallery?
    // Actually, stick to the viewMode map.
    return viewMode;
  }, [viewMode]);

  return (
    <div className="flex w-full h-[100dvh] bg-slate-100 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar
          activeView={viewMode === 'chat' ? 'recents' : viewMode}
          onGoHome={handleGoHome}
          onGoChats={handleGoChats}
          onGoProfile={handleGoProfile}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full w-full relative bg-slate-50">
        
        {/* Mobile Sticky Header (Only for main tabs) */}
        {viewMode !== 'chat' && (
          <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
             <div className="flex items-center gap-2">
                <span className="text-xl">💎</span>
                <span className="font-bold text-slate-800 text-lg">Gemini Gems</span>
             </div>
             {viewMode === 'gallery' && (
               <button 
                 onClick={() => setShowCreateModal(true)}
                 className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full shadow-md active:scale-90 transition-transform"
               >
                 <Plus className="w-5 h-5" />
               </button>
             )}
          </div>
        )}

        <main className="flex-1 overflow-hidden relative w-full">
          {viewMode === 'gallery' && (
            <div className="h-full overflow-y-auto pb-24 md:pb-0 px-4 md:px-8 pt-6 md:pt-10">
              <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Desktop Header with Create Button */}
                <div className="flex items-end justify-between animate-[fadeIn_0.5s_ease-out]">
                  <div className="text-left">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">
                      Hello, Human
                    </h1>
                    <p className="text-sm md:text-lg text-slate-500">
                      Who would you like to talk to today?
                    </p>
                  </div>
                  {/* Desktop Create Button Positioned Here */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Gem</span>
                  </button>
                </div>

                <div className="animate-[fadeIn_0.7s_ease-out]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {gems.map((gem) => (
                      <GemCard 
                        key={gem.id} 
                        gem={gem} 
                        onClick={handleSelectGem} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'recents' && (
            <RecentChats 
              sessions={sessions}
              gems={gems}
              onSelectGem={handleSelectGem}
            />
          )}

          {viewMode === 'chat' && activeGem && (
            <div className="h-full w-full md:p-4 z-20 absolute inset-0 bg-slate-50">
              <ChatArea 
                gem={activeGem} 
                initialMessages={sessions[activeGem.id] || []}
                onUpdateMessages={handleUpdateMessages}
                onBack={handleGoChats} 
              />
            </div>
          )}

          {viewMode === 'profile' && (
            <ProfileSection />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        {viewMode !== 'chat' && (
          <div className="md:hidden absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-30">
            <div className="grid grid-cols-3 p-2 pb-5">
              <button 
                onClick={handleGoHome}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${viewMode === 'gallery' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Home className={`w-6 h-6 ${viewMode === 'gallery' ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold">Home</span>
              </button>
              
              <button 
                onClick={handleGoChats}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${viewMode === 'recents' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <MessageSquare className={`w-6 h-6 ${viewMode === 'recents' ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold">Chats</span>
              </button>

              <button 
                onClick={handleGoProfile}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${viewMode === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <UserCircle className={`w-6 h-6 ${viewMode === 'profile' ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-bold">Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGemModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGem}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
}

export default App;