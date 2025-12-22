import React from 'react';
import { Gem } from '../types';
import { GemIcon } from './GemIcon';

interface GemCardProps {
  gem: Gem;
  onClick: (gem: Gem) => void;
}

const colorClasses: Record<string, string> = {
  fuchsia: 'bg-fuchsia-100 text-fuchsia-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  sky: 'bg-sky-100 text-sky-600',
  amber: 'bg-amber-100 text-amber-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  rose: 'bg-rose-100 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

export const GemCard: React.FC<GemCardProps> = ({ gem, onClick }) => {
  const colorClass = colorClasses[gem.color] || colorClasses['slate'];

  return (
    <button
      onClick={() => onClick(gem)}
      className="group w-full flex flex-col items-start p-5 bg-white rounded-3xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all duration-200 text-left h-full hover:shadow-md hover:border-slate-200"
    >
      <div className={`p-3.5 rounded-2xl mb-4 ${colorClass}`}>
        <GemIcon icon={gem.icon} className="w-7 h-7" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{gem.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
          {gem.description}
        </p>
      </div>
    </button>
  );
};