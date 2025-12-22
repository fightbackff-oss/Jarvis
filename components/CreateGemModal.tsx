import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Gem } from '../types';
import { GemIcon } from './GemIcon';

interface CreateGemModalProps {
  onClose: () => void;
  onCreate: (gem: Gem) => void;
}

const icons: Gem['icon'][] = ['brain', 'briefcase', 'code', 'sparkles', 'book', 'heart', 'music'];
const colors = ['fuchsia', 'emerald', 'sky', 'amber', 'indigo', 'rose', 'slate'];

export const CreateGemModal: React.FC<CreateGemModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<Gem['icon']>('sparkles');
  const [selectedColor, setSelectedColor] = useState('indigo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !systemInstruction) return;

    const newGem: Gem = {
      id: `custom-${Date.now()}`,
      name,
      description,
      systemInstruction,
      icon: selectedIcon,
      color: selectedColor,
      starterPrompts: ["Hello!", "What can you do?", "Help me out."]
    };

    onCreate(newGem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="bg-slate-50 w-full md:w-auto md:max-w-lg md:rounded-2xl rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto absolute top-2 left-0 right-0" />
          <h2 className="text-lg font-bold text-slate-800 mt-2 md:mt-0">Create Gem</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 bg-slate-50">
          <div className="flex justify-center mb-2">
             <div className={`p-5 rounded-3xl bg-${selectedColor}-100 text-${selectedColor}-600 transition-colors duration-300 shadow-sm`}>
                <GemIcon icon={selectedIcon} className="w-12 h-12" />
             </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your assistant"
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does it do?"
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Instructions</label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                placeholder="Define the personality and expertise..."
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none h-32 resize-none text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Icon</label>
              <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-3 rounded-2xl transition-all flex-shrink-0 ${
                      selectedIcon === icon 
                        ? 'bg-slate-800 text-white shadow-lg scale-105' 
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    <GemIcon icon={icon} className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Color Theme</label>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-[3px] transition-all flex-shrink-0 ${
                      selectedColor === color 
                        ? 'border-slate-800 scale-110' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className={`w-full h-full rounded-full bg-${color}-400 shadow-sm`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white pb-safe">
          <button
            onClick={handleSubmit}
            disabled={!name || !description || !systemInstruction}
            className={`w-full py-4 rounded-2xl text-base font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${!name || !description || !systemInstruction 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 hover:bg-slate-800'}
            `}
          >
            <Check className="w-5 h-5" />
            Create Gem
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}</style>
    </div>
  );
};