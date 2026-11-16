/**
 * formatting.js
 * ─────────────
 * Display helpers: Indian ₹ formatting, dates, percentages.
 */

/**
 * Format a number as Indian Rupee string with lakhs/crore grouping.
 * e.g. 100000 → "₹1,00,000"
 */
export function formatINR(amount, decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Short format: abbreviate large numbers.
 * e.g. 150000 → "₹1.5L", 10000000 → "₹1Cr"
 */
export function formatINRShort(amount) {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)}Cr`;
  if (amount >= 1_00_000)    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000)       return `₹${(amount / 1_000).toFixed(1)}K`;
  return formatINR(amount);
}

/**
 * Format a "YYYY-MM-DD" string to a human-readable date.
 * e.g. "2024-11-02" → "02 Nov 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format a date string to a short weekday + date.
 * e.g. "Mon, 02 Nov"
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}

/**
 * Returns today as "YYYY-MM-DD".
 */
export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns a display label for a date: "Today", "Yesterday", or formatted date.
 */
export function getRelativeDateLabel(dateStr) {
  const today = getTodayStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === yStr)  return 'Yesterday';
  return formatDate(dateStr);
}

/**
 * Format a percentage for display.
 */
export function formatPercent(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID (timestamp + random suffix).
 * Not cryptographically secure, but fine for localStorage.
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
