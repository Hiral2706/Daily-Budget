/**
 * storage.js
 * ──────────
 * Thin localStorage abstraction.
 * All keys are prefixed with "db_" to avoid collisions.
 * When you add a backend, replace these functions with fetch() calls — the
 * rest of the app doesn't change.
 */

const PREFIX = 'dailybudget_';

export const StorageKeys = {
  SETTINGS: `${PREFIX}settings`,
  EXPENSES: `${PREFIX}expenses`,
};

/** Read and JSON-parse a value; returns defaultValue if missing/corrupt. */
export function storageGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/** JSON-stringify and store a value. */
export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('StorageSet failed:', e);
    return false;
  }
}

/** Remove a key entirely. */
export function storageRemove(key) {
  localStorage.removeItem(key);
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export function loadSettings() {
  return storageGet(StorageKeys.SETTINGS, null);
}

export function saveSettings(settings) {
  return storageSet(StorageKeys.SETTINGS, settings);
}

export function loadExpenses() {
  return storageGet(StorageKeys.EXPENSES, []);
}

export function saveExpenses(expenses) {
  return storageSet(StorageKeys.EXPENSES, expenses);
}

/** Add a single expense; returns the updated list. */
export function addExpense(expense) {
  const list = loadExpenses();
  list.push(expense);
  saveExpenses(list);
  return list;
}

/** Update an expense by id; returns the updated list. */
export function updateExpense(id, updates) {
  const list = loadExpenses().map((e) => (e.id === id ? { ...e, ...updates } : e));
  saveExpenses(list);
  return list;
}

/** Delete an expense by id; returns the updated list. */
export function deleteExpense(id) {
  const list = loadExpenses().filter((e) => e.id !== id);
  saveExpenses(list);
  return list;
}
