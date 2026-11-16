import React from 'react';
import { AlertTriangle, XCircle, X } from 'lucide-react';

/**
 * type: 'warning' | 'danger'
 */
export default function AlertBanner({ type = 'warning', message, onDismiss }) {
  if (!message) return null;

  const styles = {
    warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300',
    danger:  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  };
  const Icon = type === 'danger' ? XCircle : AlertTriangle;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm animate-slide-up ${styles[type]}`}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 font-medium">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
