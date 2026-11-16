import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, RotateCcw, Download, Flame, Target, Plus, Trash2, IndianRupee,
} from 'lucide-react';
import {
  computeDailyBudget, resolveSavingsGoal, daysInMonth, getNoSpendStreak,
  currentMonthKey,
} from '../utils/budgetCalculations';
import { formatINR, generateId } from '../utils/formatting';
import { downloadCSV } from '../utils/csvExport';

export default function Settings() {
  const { state, actions } = useApp();
  const { settings, expenses } = state;
  const navigate = useNavigate();
  const [showReset, setShowReset] = useState(false);

  // Local editable copies
  const [salary, setSalary]               = useState(String(settings.salary));
  const [savingsGoalValue, setSavingsGoalValue] = useState(String(settings.savingsGoalValue));
  const [savingsGoalType, setSavingsGoalType]   = useState(settings.savingsGoalType);
  const [creditDate, setCreditDate]       = useState(String(settings.creditDate));
  const [rolloverMode, setRolloverMode]   = useState(settings.rolloverMode);
  const [fixedExpenses, setFixedExpenses] = useState(settings.fixedExpenses || []);
  const [newFixed, setNewFixed]           = useState({ label: '', amount: '' });
  const [saved, setSaved]                 = useState(false);

  const monthKey = currentMonthKey();
  const now = new Date();
  const totalDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);

  const savingsGoal = useMemo(() =>
    resolveSavingsGoal(parseFloat(salary) || 0, parseFloat(savingsGoalValue) || 0, savingsGoalType),
    [salary, savingsGoalValue, savingsGoalType]
  );
  const fixedTotal = fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const dailyBudget = computeDailyBudget(
    parseFloat(salary) || 0, savingsGoal, fixedTotal, totalDays
  );

  const noSpendStreak = useMemo(() => getNoSpendStreak(expenses), [expenses]);

  function addFixed() {
    if (!newFixed.label || !newFixed.amount) return;
    setFixedExpenses((prev) => [...prev, { id: generateId(), label: newFixed.label, amount: parseFloat(newFixed.amount) }]);
    setNewFixed({ label: '', amount: '' });
  }

  function handleSave() {
    actions.updateSettings({
      salary: parseFloat(salary) || 0,
      savingsGoalValue: parseFloat(savingsGoalValue) || 0,
      savingsGoalType,
      creditDate: parseInt(creditDate),
      rolloverMode,
      fixedExpenses,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    actions.resetAll();
    navigate('/setup');
  }

  function handleExport() {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
    downloadCSV(monthExpenses, settings);
  }

  return (
    <div className="page-container animate-fade-in space-y-5">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>

      {/* Savings streak */}
      {noSpendStreak > 0 && (
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">{noSpendStreak} day no-spend streak!</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Keep it up 🔥</p>
          </div>
        </div>
      )}

      {/* Live budget preview */}
      <div className="gradient-card">
        <div className="flex items-center gap-2 mb-2">
          <IndianRupee size={16} className="text-primary-200" />
          <p className="text-primary-100 text-sm font-medium">Recalculated Daily Budget</p>
        </div>
        <p className="text-4xl font-black">{formatINR(dailyBudget)}</p>
        <p className="text-primary-100 text-xs mt-1">per day · Updates as you edit</p>
      </div>

      {/* Salary */}
      <div className="card space-y-3">
        <h2 className="font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          <Target size={16} className="text-primary-600 dark:text-primary-400" /> Income & Savings
        </h2>
        <div>
          <label className="label">Monthly Salary (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
            <input type="number" className="input-field pl-8" value={salary} onChange={(e) => setSalary(e.target.value)} inputMode="numeric" />
          </div>
        </div>
        <div>
          <label className="label">Savings Goal</label>
          <div className="flex gap-2 mb-2">
            {['percent', 'amount'].map((t) => (
              <button key={t} onClick={() => setSavingsGoalType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${savingsGoalType === t ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                {t === 'percent' ? '% of Salary' : 'Fixed ₹'}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
              {savingsGoalType === 'percent' ? '%' : '₹'}
            </span>
            <input type="number" className="input-field pl-8" value={savingsGoalValue} onChange={(e) => setSavingsGoalValue(e.target.value)} inputMode="numeric" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">= {formatINR(savingsGoal)} / month</p>
        </div>
        <div>
          <label className="label">Salary Credit Date</label>
          <select className="input-field" value={creditDate} onChange={(e) => setCreditDate(e.target.value)}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fixed expenses */}
      <div className="card space-y-3">
        <h2 className="font-bold text-gray-900 dark:text-gray-50">Fixed Monthly Expenses</h2>
        <div className="space-y-2">
          {fixedExpenses.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{f.label}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{formatINR(f.amount)}</p>
              </div>
              <button onClick={() => setFixedExpenses((p) => p.filter((x) => x.id !== f.id))} className="p-1.5 text-red-400 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" className="input-field flex-1" placeholder="Label" value={newFixed.label} onChange={(e) => setNewFixed((p) => ({ ...p, label: e.target.value }))} />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input type="number" className="input-field pl-7" placeholder="Amount" value={newFixed.amount} onChange={(e) => setNewFixed((p) => ({ ...p, amount: e.target.value }))} inputMode="numeric" />
          </div>
          <button onClick={addFixed} className="btn-primary px-3">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Rollover mode */}
      <div className="card space-y-3">
        <h2 className="font-bold text-gray-900 dark:text-gray-50">Underspend Rollover</h2>
        <div className="flex gap-2">
          {[
            { value: 'rollover', label: 'Carry forward', desc: 'Adds to next day' },
            { value: 'savings',  label: 'Save it',       desc: 'Moves to savings' },
          ].map(({ value, label, desc }) => (
            <button key={value} onClick={() => setRolloverMode(value)}
              className={`flex-1 p-3 rounded-xl text-left border-2 transition-all ${rolloverMode === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dark mode toggle */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.darkMode ? <Moon size={18} className="text-primary-500" /> : <Sun size={18} className="text-orange-400" />}
          <span className="font-semibold text-gray-900 dark:text-gray-50 text-sm">Dark Mode</span>
        </div>
        <button
          onClick={() => actions.updateSettings({ darkMode: !settings.darkMode })}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${settings.darkMode ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      {/* Save */}
      <button onClick={handleSave} className="btn-primary w-full">
        {saved ? '✅ Saved!' : 'Save Settings'}
      </button>

      {/* Export CSV */}
      <button onClick={handleExport} className="btn-secondary w-full flex items-center justify-center gap-2">
        <Download size={18} /> Export This Month as CSV
      </button>

      {/* Reset */}
      <div className="card border-red-100 dark:border-red-900/30">
        <h2 className="font-bold text-red-600 dark:text-red-400 text-sm mb-2">Danger Zone</h2>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400 font-medium">
            <RotateCcw size={15} /> Reset all data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">This will delete all expenses and settings. Are you sure?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowReset(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm">Yes, Reset</button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <p className="text-center text-xs text-gray-300 dark:text-gray-600 pb-4">
        DailyBudget v1.0.0 · Data stored locally on your device
      </p>
    </div>
  );
}
