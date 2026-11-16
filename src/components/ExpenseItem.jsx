import React, { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatting';
import CategoryIcon from './CategoryIcon';
import { useApp } from '../context/AppContext';

const modeColors = {
  UPI:   'bg-blue-50  text-blue-600  dark:bg-blue-900/30  dark:text-blue-400',
  Cash:  'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  Card:  'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function ExpenseItem({ expense, onEdit }) {
  const { actions } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (confirmDelete) {
      actions.deleteExpense(expense.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800
                    overflow-hidden transition-all duration-200 animate-fade-in">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Category icon */}
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
          <CategoryIcon category={expense.category} size={20} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm truncate">{expense.category}</p>
            <span className={`chip text-xs px-2 py-0.5 ${modeColors[expense.mode] || 'bg-gray-100 text-gray-600'}`}>
              {expense.mode}
            </span>
          </div>
          {expense.note && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{expense.note}</p>
          )}
        </div>

        {/* Amount + expand */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <p className="font-bold text-gray-900 dark:text-gray-50">{formatINR(expense.amount)}</p>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div className="px-3 pb-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-2 animate-fade-in">
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(expense.date)}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(expense)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium
                         bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                confirmDelete
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
              }`}
            >
              <Trash2 size={12} /> {confirmDelete ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
