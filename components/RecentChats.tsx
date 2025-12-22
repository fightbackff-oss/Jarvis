import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { Gem, Message } from '../types';
import { GemIcon } from './GemIcon';

interface RecentChatsProps {
  sessions: Record<string, Message[]>;
  gems: Gem[];
  onSelectGem: (gem: Gem) => void;
}

export const RecentChats: React.FC<RecentChatsProps> = ({ sessions, gems, onSelectGem }) => {
  const recentGemIds = Object.keys(sessions)
    .filter(id => sessions[id].length > 0)
    .sort((a, b) => {
      const sessionA = sessions[a];
      const sessionB = sessions[b];
      const lastA = sessionA[sessionA.length - 1]?.timestamp || 0;
      const lastB = sessionB[sessionB.length - 1]?.timestamp || 0;
      return lastB - lastA;
    });

  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-0 px-4 md:px-8 pt-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Recent Chats</h1>
        
        {recentGemIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="p-6 bg-slate-100 rounded-full mb-4">
               <MessageSquare className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-medium">No recent conversations.</p>
            <p className="text-sm mt-1">Start chatting with a Gem to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentGemIds.map(id => {
              const gem = gems.find(g => g.id === id);
              if (!gem) return null;
              const messages = sessions[id];
              const lastMsg = messages[messages.length - 1];
              const time = new Date(lastMsg.timestamp);
              const isToday = time.toDateString() === new Date().toDateString();
              const dateDisplay = isToday 
                ? time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : time.toLocaleDateString([], {month: 'short', day: 'numeric'});

              return (
                <button
                  key={id}
                  onClick={() => onSelectGem(gem)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left group active:scale-[0.99]"
                >
                  <div className={`p-3.5 rounded-xl bg-${gem.color}-100 text-${gem.color}-600 group-hover:scale-105 transition-transform`}>
                    <GemIcon icon={gem.icon} className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{gem.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                        {dateDisplay}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate leading-relaxed opacity-90">{lastMsg.content}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};