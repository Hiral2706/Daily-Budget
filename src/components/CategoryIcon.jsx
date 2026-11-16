import React from 'react';
import {
  ShoppingBag, UtensilsCrossed, Car, Zap, Heart, HelpCircle, Home, Briefcase,
} from 'lucide-react';

const iconMap = {
  Food:     { icon: UtensilsCrossed, color: 'text-orange-500' },
  Travel:   { icon: Car,             color: 'text-blue-500'   },
  Shopping: { icon: ShoppingBag,     color: 'text-pink-500'   },
  Bills:    { icon: Zap,             color: 'text-yellow-500' },
  Health:   { icon: Heart,           color: 'text-red-500'    },
  Home:     { icon: Home,            color: 'text-teal-500'   },
  Work:     { icon: Briefcase,       color: 'text-indigo-500' },
  Other:    { icon: HelpCircle,      color: 'text-gray-400'   },
};

export const CATEGORIES = Object.keys(iconMap);

export default function CategoryIcon({ category, size = 20, className = '' }) {
  const match = iconMap[category] || iconMap.Other;
  const { icon: Icon, color } = match;
  return <Icon size={size} className={`${color} ${className}`} strokeWidth={1.8} />;
}
