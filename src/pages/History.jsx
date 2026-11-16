import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ExpenseItem from '../components/ExpenseItem';
import { formatINR, getRelativeDateLabel } from '../utils/formatting';
import { Filter, X } from 'lucide-react';
import { CATEGORIES } from '../components/CategoryIcon';

const MODES = ['All', 'UPI', 'Cash', 'Card'];
const CATS  = ['All', ...CATEGORIES];

export default function History() {
  const { state, actions } = useApp();
  const { expenses } = state;
  const [filterMode, setFilterMode] = useState('All');
  const [filterCat,  setFilterCat]  = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const modeOk = filterMode === 'All' || e.mode === filterMode;
      const catOk  = filterCat  === 'All' || e.category === filterCat;
      return modeOk && catOk;
    });
  }, [expenses, filterMode, filterCat]);

  // Group by date descending
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const hasFilters = filterMode !== 'All' || filterCat !== 'All';

  function handleEditSave(updates) {
    actions.updateExpense(editExpense.id, updates);
    setEditExpense(null);
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">History</h1>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={() => { setFilterMode('All'); setFilterCat('All'); }}
              className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg"
            >
              <X size={12} /> Clear
            </button>
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors ${
              showFilters ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card space-y-3 mb-4 animate-slide-up">
          <div>
            <label className="label">Payment Mode</label>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterMode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filterCat === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense groups */}
      {grouped.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No expenses found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, dayExpenses]) => {
            const total = dayExpenses.reduce((s, e) => s + e.amount, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {getRelativeDateLabel(date)}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50">{formatINR(total)}</p>
                </div>
                <div className="space-y-2">
                  {dayExpenses.map((e) => (
                    <ExpenseItem key={e.id} expense={e} onEdit={setEditExpense} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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

function EditModal({ expense, onSave, onClose }) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [note, setNote]     = useState(expense.note || '');
  const [mode, setMode]     = useState(expense.mode);
  const [category, setCategory] = useState(expense.category);
  const [date, setDate]     = useState(expense.date);
  const MODES_ = ['UPI', 'Cash', 'Card'];

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
            {MODES_.map((m) => (
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
        <div>
          <label className="label">Date</label>
          <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => onSave({ amount: parseFloat(amount) || 0, mode, category, note, date })}
            className="btn-primary flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
