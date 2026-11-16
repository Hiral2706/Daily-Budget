import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMonthDayStats, computeDailyBudget, resolveSavingsGoal, daysInMonth,
} from '../utils/budgetCalculations';
import { formatINR } from '../utils/formatting';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar() {
  const { state } = useApp();
  const { settings, expenses } = state;

  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [selected,  setSelected]  = useState(null);

  const savingsGoal = useMemo(() =>
    resolveSavingsGoal(settings.salary, settings.savingsGoalValue, settings.savingsGoalType),
    [settings]
  );
  const fixedTotal = useMemo(() =>
    (settings.fixedExpenses || []).reduce((s, f) => s + f.amount, 0),
    [settings.fixedExpenses]
  );
  const totalDays = daysInMonth(viewYear, viewMonth);
  const dailyBudget = useMemo(() =>
    computeDailyBudget(settings.salary, savingsGoal, fixedTotal, totalDays),
    [settings.salary, savingsGoal, fixedTotal, totalDays]
  );

  const dayStats = useMemo(() =>
    getMonthDayStats(expenses, dailyBudget, viewYear, viewMonth),
    [expenses, dailyBudget, viewYear, viewMonth]
  );

  // First weekday of the month (0=Sun)
  const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const selectedStat = selected ? dayStats[selected - 1] : null;
  const selectedDate = selected
    ? `${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(selected).padStart(2,'0')}`
    : null;
  const selectedExpenses = selectedDate
    ? expenses.filter((e) => e.date === selectedDate)
    : [];

  const underDays = dayStats.filter((d) => d.status === 'under').length;
  const overDays  = dayStats.filter((d) => d.status === 'over').length;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50 min-w-[100px] text-center">
            {MONTHS[viewMonth - 1]} {viewYear}
          </span>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary-400 inline-block" /> Under ({underDays})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Over ({overDays})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" /> Future
        </span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dayStats.map(({ day, spent, status }) => {
          const isToday = day === now.getDate() && viewMonth === now.getMonth() + 1 && viewYear === now.getFullYear();
          const isSelected = selected === day;
          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : day)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all
                ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
                ${status === 'under' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200' :
                  status === 'over'  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                                       'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-500'}
                ${isToday ? 'ring-2 ring-primary-500' : ''}
              `}
            >
              <span className={`font-bold text-sm ${isToday ? 'text-primary-600 dark:text-primary-400' : ''}`}>{day}</span>
              {spent > 0 && (
                <span className="text-[8px] font-medium opacity-70 leading-none mt-0.5">
                  {spent >= 1000 ? `${(spent/1000).toFixed(1)}k` : spent}
                </span>
              )}
              {isToday && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedStat && (
        <div className="mt-5 card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-900 dark:text-gray-50">
              {MONTHS[viewMonth - 1]} {selected}
            </p>
            <span className={`chip text-xs ${
              selectedStat.status === 'under' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' :
              selectedStat.status === 'over'  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {selectedStat.status === 'under' ? '✅ Under budget' :
               selectedStat.status === 'over'  ? '🔴 Over budget' : '🔵 Future'}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500 dark:text-gray-400">Spent</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">{formatINR(selectedStat.spent)}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500 dark:text-gray-400">Budget</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">{formatINR(selectedStat.budget)}</span>
          </div>
          {selectedExpenses.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
              {selectedExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{e.category}</span>
                    {e.note && <span className="text-gray-400 dark:text-gray-500 text-xs ml-2">· {e.note}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{e.mode}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-50">{formatINR(e.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
