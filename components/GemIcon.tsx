import React from 'react';
import { Brain, Briefcase, Code, Sparkles, Book, Heart, Music, Bot, LucideIcon } from 'lucide-react';
import { Gem } from '../types';

interface GemIconProps {
  icon: Gem['icon'];
  className?: string;
}

const iconMap: Record<Gem['icon'], LucideIcon> = {
  brain: Brain,
  briefcase: Briefcase,
  code: Code,
  sparkles: Sparkles,
  book: Book,
  heart: Heart,
  music: Music,
  bot: Bot,
};

export const GemIcon: React.FC<GemIconProps> = ({ icon, className }) => {
  const IconComponent = iconMap[icon] || Sparkles;
  return <IconComponent className={className} />;
};