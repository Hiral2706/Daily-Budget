/**
 * csvExport.js
 * ─────────────
 * Exports a month's expense data as a CSV file.
 */

import { formatINR } from './formatting';

/**
 * Build a CSV string from the given expense array.
 * @param {Array}  expenses  - filtered to the desired month
 * @param {Object} settings  - for header metadata (salary, etc.)
 * @returns {string} CSV content
 */
export function buildCSV(expenses, settings) {
  const headers = ['Date', 'Amount (₹)', 'Mode', 'Category', 'Note'];
  const rows = expenses
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [
      e.date,
      e.amount.toFixed(2),
      e.mode,
      e.category,
      `"${(e.note || '').replace(/"/g, '""')}"`, // escape quotes
    ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const csv = [
    [`# DailyBudget Export — ${new Date().toLocaleDateString('en-IN')}`],
    [`# Salary: ${formatINR(settings?.salary)}  |  Month: ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`],
    [],
    headers,
    ...rows,
    [],
    ['', `Total: ₹${total.toFixed(2)}`],
  ]
    .map((r) => r.join(','))
    .join('\n');

  return csv;
}

/**
 * Trigger a browser download of the CSV.
 */
export function downloadCSV(expenses, settings, filename) {
  const csv = buildCSV(expenses, settings);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `dailybudget_${new Date().toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
