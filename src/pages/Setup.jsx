import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Wallet, Target, Home, Calendar, ChevronRight, Plus, Trash2, IndianRupee } from 'lucide-react';
import { generateId } from '../utils/formatting';

const STEPS = ['Welcome', 'Salary', 'Savings', 'Fixed', 'Review'];

export default function Setup() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [salary, setSalary] = useState('');
  const [savingsGoalValue, setSavingsGoalValue] = useState('20');
  const [savingsGoalType, setSavingsGoalType] = useState('percent');
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [newFixed, setNewFixed] = useState({ label: '', amount: '' });
  const [creditDate, setCreditDate] = useState('1');
  const [rolloverMode, setRolloverMode] = useState('rollover');

  function addFixed() {
    if (!newFixed.label || !newFixed.amount) return;
    setFixedExpenses((prev) => [...prev, { id: generateId(), label: newFixed.label, amount: parseFloat(newFixed.amount) }]);
    setNewFixed({ label: '', amount: '' });
  }
  function removeFixed(id) { setFixedExpenses((prev) => prev.filter((f) => f.id !== id)); }

  function handleFinish() {
    actions.updateSettings({
      salary: parseFloat(salary) || 0,
      savingsGoalValue: parseFloat(savingsGoalValue) || 0,
      savingsGoalType,
      fixedExpenses,
      creditDate: parseInt(creditDate),
      rolloverMode,
      isSetupDone: true,
    });
    navigate('/');
  }

  const salaryNum = parseFloat(salary) || 0;
  const savingsNum = savingsGoalType === 'percent'
    ? (salaryNum * parseFloat(savingsGoalValue || 0)) / 100
    : parseFloat(savingsGoalValue || 0);
  const fixedTotal = fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const spendable = salaryNum - savingsNum - fixedTotal;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dailyBudget = spendable > 0 ? spendable / daysInMonth : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-950 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
            <IndianRupee size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">DailyBudget</h1>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mt-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">{step + 1} of {STEPS.length}</p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 overflow-y-auto">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
              Take control of your <span className="text-primary-600">money</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              Set up your salary, savings goal, and fixed expenses. We'll calculate your daily spending budget automatically.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Wallet,   text: 'Daily budget calculated from your salary'  },
                { icon: Target,   text: 'Hit your savings goal every month'         },
                { icon: Home,     text: 'Fixed expenses auto-deducted'              },
                { icon: Calendar, text: 'Calendar view of every day\'s spending'   },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Salary */}
        {step === 1 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Monthly Salary</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your take-home salary after tax.</p>
            </div>
            <div>
              <label className="label">Salary Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input
                  type="number"
                  className="input-field pl-8"
                  placeholder="e.g. 50000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>
            <div>
              <label className="label">Salary Credit Date</label>
              <select
                className="input-field"
                value={creditDate}
                onChange={(e) => setCreditDate(e.target.value)}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Savings */}
        {step === 2 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Savings Goal</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">How much do you want to save each month?</p>
            </div>
            <div className="flex gap-2">
              {['percent', 'amount'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSavingsGoalType(t)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    savingsGoalType === t
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t === 'percent' ? '% of Salary' : 'Fixed ₹ Amount'}
                </button>
              ))}
            </div>
            <div>
              <label className="label">
                {savingsGoalType === 'percent' ? 'Savings %' : 'Savings Amount (₹)'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                  {savingsGoalType === 'percent' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  className="input-field pl-8"
                  placeholder={savingsGoalType === 'percent' ? 'e.g. 20' : 'e.g. 10000'}
                  value={savingsGoalValue}
                  onChange={(e) => setSavingsGoalValue(e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>
            {salary && (
              <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  Monthly savings: <strong>₹{savingsNum.toLocaleString('en-IN')}</strong>
                </p>
              </div>
            )}
            <div>
              <label className="label">Rollover Underspend</label>
              <div className="flex gap-2">
                {[
                  { value: 'rollover', label: 'Add to next day', desc: 'Leftover carries forward' },
                  { value: 'savings',  label: 'Add to savings',  desc: 'Goes into savings pool'  },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setRolloverMode(value)}
                    className={`flex-1 p-3 rounded-xl text-left border-2 transition-all ${
                      rolloverMode === value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Fixed Expenses */}
        {step === 3 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Fixed Expenses</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Rent, EMI, subscriptions — added once, deducted every month.</p>
            </div>

            {/* Add new fixed */}
            <div className="card space-y-3">
              <input
                type="text"
                className="input-field"
                placeholder="Label (e.g. Rent)"
                value={newFixed.label}
                onChange={(e) => setNewFixed((p) => ({ ...p, label: e.target.value }))}
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    className="input-field pl-8"
                    placeholder="Amount"
                    value={newFixed.amount}
                    onChange={(e) => setNewFixed((p) => ({ ...p, amount: e.target.value }))}
                    inputMode="numeric"
                  />
                </div>
                <button onClick={addFixed} className="btn-primary px-4 py-3 flex items-center gap-1">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {fixedExpenses.length > 0 && (
              <div className="space-y-2">
                {fixedExpenses.map((f) => (
                  <div key={f.id} className="card flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50 text-sm">{f.label}</p>
                      <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm">₹{f.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => removeFixed(f.id)} className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <p className="text-sm text-gray-500 text-right font-medium">
                  Total: ₹{fixedTotal.toLocaleString('en-IN')}
                </p>
              </div>
            )}
            {fixedExpenses.length === 0 && (
              <p className="text-sm text-center text-gray-400 py-4">No fixed expenses yet. You can skip this step.</p>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="animate-slide-up space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Your Budget Summary</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Everything looks good! Here's your plan.</p>
            </div>

            <div className="gradient-card">
              <p className="text-primary-100 text-sm mb-1">Your daily budget</p>
              <p className="text-5xl font-black">
                ₹{Math.round(dailyBudget).toLocaleString('en-IN')}
              </p>
              <p className="text-primary-100 text-sm mt-1">per day</p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Monthly Salary',     value: `₹${salaryNum.toLocaleString('en-IN')}`   },
                { label: 'Savings Goal',        value: `₹${Math.round(savingsNum).toLocaleString('en-IN')}` },
                { label: 'Fixed Expenses',      value: `₹${fixedTotal.toLocaleString('en-IN')}`  },
                { label: 'Spendable Budget',    value: `₹${Math.round(spendable).toLocaleString('en-IN')}` },
                { label: 'Days in Month',       value: daysInMonth                              },
              ].map(({ label, value }) => (
                <div key={label} className="card flex items-center justify-between py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-50">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="px-6 pb-10 pt-4 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="btn-secondary flex-1"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !salary}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleFinish} className="btn-primary flex-1">
            Start Tracking 🎉
          </button>
        )}
      </div>
    </div>
  );
}
