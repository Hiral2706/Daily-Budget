import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import CategoryPieChart from '../components/charts/PieChart';
import WeeklyBarChart from '../components/charts/BarChart';
import {
  getCategoryBreakdown, getModeSplit, getWeeklyTrend, generateTip,
  computeDailyBudget, resolveSavingsGoal, daysInMonth, currentMonthKey,
} from '../utils/budgetCalculations';
import { formatINR } from '../utils/formatting';
import { Lightbulb, Smartphone, Banknote, CreditCard } from 'lucide-react';

const modeIcons = { UPI: Smartphone, Cash: Banknote, Card: CreditCard };
const modeColors = {
  UPI:  'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-300',
  Cash: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Card: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function Insights() {
  const { state } = useApp();
  const { settings, expenses } = state;

  const monthKey = currentMonthKey();
  const now = new Date();
  const totalDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);

  const savingsGoal = useMemo(() =>
    resolveSavingsGoal(settings.salary, settings.savingsGoalValue, settings.savingsGoalType),
    [settings]
  );
  const fixedTotal = useMemo(() =>
    (settings.fixedExpenses || []).reduce((s, f) => s + f.amount, 0),
    [settings.fixedExpenses]
  );
  const dailyBudget = useMemo(() =>
    computeDailyBudget(settings.salary, savingsGoal, fixedTotal, totalDays),
    [settings.salary, savingsGoal, fixedTotal, totalDays]
  );

  const categoryData  = useMemo(() => getCategoryBreakdown(expenses, monthKey), [expenses, monthKey]);
  const modeData      = useMemo(() => getModeSplit(expenses, monthKey),         [expenses, monthKey]);
  const weeklyTrend   = useMemo(() => getWeeklyTrend(expenses),                 [expenses]);
  const tip           = useMemo(() => generateTip(weeklyTrend),                 [weeklyTrend]);

  const totalSpentThisMonth = useMemo(() =>
    expenses.filter((e) => e.date.startsWith(monthKey)).reduce((s, e) => s + e.amount, 0),
    [expenses, monthKey]
  );
  const topCategory = categoryData.length
    ? categoryData.reduce((a, b) => (a.value > b.value ? a : b))
    : null;

  return (
    <div className="page-container animate-fade-in space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Insights</h1>

      {/* Month summary */}
      <div className="gradient-card">
        <p className="text-primary-100 text-sm">Total spent this month</p>
        <p className="text-4xl font-black mt-1">{formatINR(totalSpentThisMonth)}</p>
        {topCategory && (
          <p className="text-primary-100 text-sm mt-2">
            Top category: <strong>{topCategory.name}</strong> ({formatINR(topCategory.value)})
          </p>
        )}
      </div>

      {/* Tip */}
      {tip && (
        <div className="card flex items-start gap-3 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/10">
          <Lightbulb size={18} className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
        </div>
      )}

      {/* Category breakdown */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-gray-50 mb-3">Category Breakdown</h2>
        <CategoryPieChart data={categoryData} />
      </div>

      {/* Payment mode split */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-gray-50 mb-3">Payment Mode Split</h2>
        {modeData.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No data yet</p>
        ) : (
          <div className="space-y-3">
            {modeData.map(({ name, value }) => {
              const Icon = modeIcons[name] || CreditCard;
              const pct  = totalSpentThisMonth > 0 ? (value / totalSpentThisMonth) * 100 : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`flex items-center gap-2 chip text-xs ${modeColors[name] || 'bg-gray-100 text-gray-600'}`}>
                      <Icon size={12} />
                      {name}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{formatINR(value)}</span>
                      <span className="text-xs text-gray-400 ml-1">({Math.round(pct)}%)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        name === 'UPI' ? 'bg-blue-400' : name === 'Cash' ? 'bg-primary-400' : 'bg-purple-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly trend */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-gray-50 mb-1">7-Day Spending Trend</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Dashed line = daily budget</p>
        <WeeklyBarChart data={weeklyTrend} dailyBudget={dailyBudget} />
      </div>
    </div>
  );
}
