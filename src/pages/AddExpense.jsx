import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { generateId, getTodayStr } from '../utils/formatting';
import CategoryIcon, { CATEGORIES } from '../components/CategoryIcon';

const MODES = ['UPI', 'Cash', 'Card'];

export default function AddExpense() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};

  const [amount, setAmount] = useState(prefill.amount || '');
  const [mode, setMode] = useState(prefill.mode || 'UPI');
  const [category, setCategory] = useState(prefill.category || 'Food');
  const [note, setNote] = useState(prefill.note || '');
  const [date, setDate] = useState(prefill.date || getTodayStr());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!amount || parseFloat(amount) <= 0) return;
    const expense = {
      id: generateId(),
      amount: parseFloat(amount),
      mode,
      category,
      note,
      date,
      createdAt: new Date().toISOString(),
    };
    actions.addExpense(expense);
    setSaved(true);
    setTimeout(() => navigate('/'), 800);
  }

  if (saved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 animate-fade-in">
        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce-in">
          <CheckCircle size={44} className="text-primary-600" />
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-50">Expense Added!</p>
        <p className="text-gray-400 text-sm mt-1">Redirecting to home…</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Add Expense</h1>
      </div>

      <div className="space-y-5">
        {/* Amount */}
        <div>
          <label className="label">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300 dark:text-gray-600">₹</span>
            <input
              type="number"
              className="input-field text-3xl font-bold pl-10 py-5"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              autoFocus
            />
          </div>
        </div>

        {/* Payment mode */}
        <div>
          <label className="label">Payment Mode</label>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                  mode === m
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 dark:shadow-primary-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  category === c
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <CategoryIcon category={c} size={22} />
                <span className={`text-[10px] font-medium ${category === c ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {c}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="label">Note (optional)</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Lunch at Sharma's"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Date */}
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input-field"
            value={date}
            max={getTodayStr()}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!amount || parseFloat(amount) <= 0}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Expense
        </button>
      </div>
    </div>
  );
}
