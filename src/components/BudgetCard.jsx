import React from 'react';
import { clamp } from '../utils/formatting';

/**
 * A stat card with an optional animated progress bar.
 * progress: 0–100 number
 * barColor: 'green' | 'orange' | 'red' | 'blue'
 */
export default function BudgetCard({
  title,
  value,
  subtitle,
  progress,
  icon: Icon,
  barColor = 'green',
  className = '',
  onClick,
}) {
  const clamped = clamp(progress ?? 0, 0, 100);

  const barColors = {
    green:  'bg-primary-500',
    orange: 'bg-orange-400',
    red:    'bg-red-500',
    blue:   'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const trackColors = {
    green:  'bg-primary-100 dark:bg-primary-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    red:    'bg-red-100 dark:bg-red-900/30',
    blue:   'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
  };

  return (
    <div
      className={`card animate-fade-in ${onClick ? 'cursor-pointer active:scale-98 transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-0.5 count-up">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <Icon size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className={`h-2 rounded-full ${trackColors[barColor]} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColors[barColor]}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
      )}
    </div>
  );
}
