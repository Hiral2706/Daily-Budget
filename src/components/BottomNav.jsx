import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Calendar, BarChart2, Settings } from 'lucide-react';

const tabs = [
  { to: '/',         icon: Home,     label: 'Home'     },
  { to: '/history',  icon: History,  label: 'History'  },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-bottom">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 py-2 flex items-center justify-around shadow-2xl">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
