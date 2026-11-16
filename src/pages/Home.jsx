import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet, Target, CalendarDays, TrendingDown, IndianRupee, Flame,
} from 'lucide-react';
import BudgetCard from '../components/BudgetCard';
import AlertBanner from '../components/AlertBanner';
import ExpenseItem from '../components/ExpenseItem';
import { useNavigate } from 'react-router-dom';
import {
  computeDailyBudget, computeWalletBalance, computeTodayRemaining, computeSavingsSoFar,
  daysRemainingInMonth, currentMonthKey, resolveSavingsGoal, daysInMonth, getTodaySpent,
  getNoSpendStreak, computeAdjustedDailyBudget,
} from '../utils/budgetCalculations';
import { formatINR, getTodayStr, clamp } from '../utils/formatting';

export default function Home() {
  const { state, actions } = useApp();
  const { settings, expenses } = state;
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [editExpense, setEditExpense] = useState(null);

  const now = new Date();
  const monthKey = currentMonthKey();
  const totalDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);
  const daysLeft = daysRemainingInMonth();
  const todayStr = getTodayStr();

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
  const adjustedDaily = useMemo(() =>
    computeAdjustedDailyBudget(expenses, dailyBudget, monthKey),
    [expenses, dailyBudget, monthKey]
  );
  const walletBalance = useMemo(() =>
    computeWalletBalance(settings.salary, savingsGoal, fixedTotal, expenses, monthKey),
    [settings, savingsGoal, fixedTotal, expenses, monthKey]
  );
  const todayRemaining = useMemo(() =>
    computeTodayRemaining(expenses, dailyBudget, settings.rolloverMode, monthKey),
    [expenses, dailyBudget, settings.rolloverMode, monthKey]
  );
  const savingsSoFar = useMemo(() =>
    computeSavingsSoFar(settings.salary, fixedTotal, expenses, monthKey),
    [settings.salary, fixedTotal, expenses, monthKey]
  );
  const todaySpent = useMemo(() => getTodaySpent(expenses, todayStr), [expenses, todayStr]);
  const noSpendStreak = useMemo(() => getNoSpendStreak(expenses), [expenses]);

  // Progress: percentage of daily budget spent today (0–100)
  const spentPercent = dailyBudget > 0 ? clamp((todaySpent / dailyBudget) * 100, 0, 150) : 0;
  const budgetBarColor = spentPercent >= 100 ? 'red' : spentPercent >= 80 ? 'orange' : 'green';

  // Today's expenses
  const todayExpenses = expenses.filter((e) => e.date === todayStr);

  // Alerts
  const showWarning = spentPercent >= 80 && spentPercent < 100 && !dismissedAlerts.includes('warn');
  const showDanger  = spentPercent >= 100 && !dismissedAlerts.includes('danger');

  function handleEditSave(updates) {
    actions.updateExpense(editExpense.id, updates);
    setEditExpense(null);
  }

  return (
    <div className="page-container space-y-4 animate-fade-in">
      {/* Greeting header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Good {getGreeting()} 👋</h1>
        </div>
        {noSpendStreak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{noSpendStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {showWarning && (
        <AlertBanner
          type="warning"
          message={`⚠️ You've used ${Math.round(spentPercent)}% of today's budget (${formatINR(todaySpent)} of ${formatINR(dailyBudget)})`}
          onDismiss={() => setDismissedAlerts((p) => [...p, 'warn'])}
        />
      )}
      {showDanger && (
        <AlertBanner
          type="danger"
          message={`🚨 Daily budget exceeded by ${formatINR(todaySpent - dailyBudget)}! Remaining days adjusted.`}
          onDismiss={() => setDismissedAlerts((p) => [...p, 'danger'])}
        />
      )}

      {/* Hero card — Today's remaining */}
      <div className={`gradient-card relative overflow-hidden ${todayRemaining < 0 ? 'from-red-500 to-red-700' : 'from-primary-500 to-primary-700'}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
          <div className="absolute -left-4 -bottom-8 w-24 h-24 rounded-full bg-white" />
        </div>
        <p className="text-primary-100 text-sm font-medium">Today's Remaining</p>
        <p className="text-5xl font-black mt-1 count-up">
          {formatINR(Math.abs(todayRemaining))}
        </p>
        {todayRemaining < 0 && <p className="text-red-200 text-xs mt-0.5">over budget</p>}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-100 mb-1.5">
            <span>₹0</span>
            <span>Spent: {formatINR(todaySpent)}</span>
            <span>{formatINR(dailyBudget)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                budgetBarColor === 'red' ? 'bg-red-300' : budgetBarColor === 'orange' ? 'bg-orange-300' : 'bg-white'
              }`}
              style={{ width: `${clamp(spentPercent, 0, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-3 text-xs text-primary-100">
          <span>Daily budget: {formatINR(adjustedDaily)}</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <BudgetCard
          title="Wallet"
          value={formatINR(walletBalance)}
          subtitle="Monthly remaining"
          icon={Wallet}
          progress={settings.salary > 0 ? clamp((walletBalance / (settings.salary - savingsGoal - fixedTotal)) * 100, 0, 100) : 0}
          barColor="green"
        />
        <BudgetCard
          title="Savings So Far"
          value={formatINR(savingsSoFar)}
          subtitle={`Goal: ${formatINR(savingsGoal)}`}
          icon={Target}
          progress={savingsGoal > 0 ? clamp((savingsSoFar / savingsGoal) * 100, 0, 100) : 0}
          barColor="blue"
        />
        <BudgetCard
          title="Days Left"
          value={daysLeft}
          subtitle={`of ${totalDays} days`}
          icon={CalendarDays}
          progress={clamp(((totalDays - daysLeft) / totalDays) * 100, 0, 100)}
          barColor="purple"
        />
        <BudgetCard
          title="Spent Today"
          value={formatINR(todaySpent)}
          subtitle={`Budget: ${formatINR(dailyBudget)}`}
          icon={TrendingDown}
          progress={spentPercent > 100 ? 100 : spentPercent}
          barColor={budgetBarColor}
        />
      </div>

      {/* Today's expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-gray-50">Today's Expenses</h2>
          {todayExpenses.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-primary-600 dark:text-primary-400 font-medium"
            >
              See all →
            </button>
          )}
        </div>

        {todayExpenses.length === 0 ? (
          <div className="card text-center py-8">
            <IndianRupee size={32} className="text-gray-200 dark:text-gray-700 mx-auto mb-2" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">No expenses yet today.</p>
            <button
              onClick={() => navigate('/add')}
              className="mt-3 btn-primary text-sm px-5 py-2"
            >
              + Add Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayExpenses.map((e) => (
              <ExpenseItem key={e.id} expense={e} onEdit={setEditExpense} />
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editExpense && (
        <EditModal
          expense={editExpense}
          onSave={handleEditSave}
          onClose={() => setEditExpense(null)}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// Inline quick-edit modal
function EditModal({ expense, onSave, onClose }) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [note, setNote] = useState(expense.note || '');
  const [mode, setMode] = useState(expense.mode);
  const [category, setCategory] = useState(expense.category);

  const MODES = ['UPI', 'Cash', 'Card'];
  const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Home', 'Work', 'Other'];

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="bottom-sheet p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-50 text-lg">Edit Expense</h3>
        <div>
          <label className="label">Amount (₹)</label>
          <input type="number" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="label">Mode</label>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <input type="text" className="input-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onSave({ amount: parseFloat(amount) || 0, mode, category, note })}
            className="btn-primary flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
