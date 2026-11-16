import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadSettings, saveSettings, loadExpenses, saveExpenses } from '../utils/storage';

// ─── Initial state ────────────────────────────────────────────────────────────

const defaultSettings = {
  salary: 0,
  savingsGoalValue: 20,
  savingsGoalType: 'percent',   // 'percent' | 'amount'
  fixedExpenses: [],            // [{ id, label, amount }]
  creditDate: 1,                // day of month salary is credited
  rolloverMode: 'rollover',     // 'rollover' | 'savings'
  darkMode: false,
  isSetupDone: false,
};

const initialState = {
  settings: loadSettings() || defaultSettings,
  expenses: loadExpenses(),
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SETTINGS': {
      const settings = { ...state.settings, ...action.payload };
      saveSettings(settings);
      return { ...state, settings };
    }
    case 'ADD_EXPENSE': {
      const expenses = [action.payload, ...state.expenses];
      saveExpenses(expenses);
      return { ...state, expenses };
    }
    case 'UPDATE_EXPENSE': {
      const expenses = state.expenses.map((e) =>
        e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
      );
      saveExpenses(expenses);
      return { ...state, expenses };
    }
    case 'DELETE_EXPENSE': {
      const expenses = state.expenses.filter((e) => e.id !== action.payload);
      saveExpenses(expenses);
      return { ...state, expenses };
    }
    case 'RESET_ALL': {
      saveSettings(defaultSettings);
      saveExpenses([]);
      return { settings: defaultSettings, expenses: [] };
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply dark mode class to <html>
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  // ── Action creators (keeps pages clean) ──
  const actions = {
    updateSettings: (payload) => dispatch({ type: 'UPDATE_SETTINGS', payload }),
    addExpense: (expense) => dispatch({ type: 'ADD_EXPENSE', payload: expense }),
    updateExpense: (id, updates) => dispatch({ type: 'UPDATE_EXPENSE', payload: { id, updates } }),
    deleteExpense: (id) => dispatch({ type: 'DELETE_EXPENSE', payload: id }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

/** Custom hook — throws if used outside provider. */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
