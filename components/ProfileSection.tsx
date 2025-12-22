import React from 'react';
import { User, Settings, Shield, LogOut, ChevronRight, Bell, CircleUser } from 'lucide-react';

export const ProfileSection = () => {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-24 md:pb-0 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white px-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-sm border-b border-slate-100">
        <div className="flex flex-col items-center">
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 border-4 border-white shadow-lg overflow-hidden">
               <CircleUser className="w-20 h-20" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm">
                <Settings className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Human User</h2>
          <p className="text-slate-500 text-sm font-medium">human@example.com</p>
        </div>

        <div className="flex justify-center gap-12 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">4</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Gems</div>
          </div>
          <div className="w-px bg-slate-100 h-12" />
          <div className="text-center">
             <div className="text-2xl font-bold text-slate-900">142</div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Chats</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
           <button className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 group">
             <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mr-4 group-hover:bg-blue-100 transition-colors">
               <User className="w-5 h-5" />
             </div>
             <div className="flex-1 text-left">
               <div className="font-semibold text-slate-900 text-sm">Account Details</div>
               <div className="text-xs text-slate-400 mt-0.5">Manage your personal info</div>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>
           
           <button className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 group">
             <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl mr-4 group-hover:bg-amber-100 transition-colors">
               <Bell className="w-5 h-5" />
             </div>
             <div className="flex-1 text-left">
               <div className="font-semibold text-slate-900 text-sm">Notifications</div>
               <div className="text-xs text-slate-400 mt-0.5">Customize your alerts</div>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>

           <button className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors group">
             <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl mr-4 group-hover:bg-emerald-100 transition-colors">
               <Shield className="w-5 h-5" />
             </div>
             <div className="flex-1 text-left">
               <div className="font-semibold text-slate-900 text-sm">Privacy & Security</div>
               <div className="text-xs text-slate-400 mt-0.5">Protect your data</div>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
           </button>
        </div>

        <button className="w-full p-4 rounded-xl border border-slate-200 text-slate-500 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-800 transition-all text-sm">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        
        <div className="text-center text-[10px] text-slate-400">
           Gemini Gems v1.0.2
        </div>
      </div>
    </div>
  );
};