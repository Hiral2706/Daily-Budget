/**
 * budgetCalculations.js
 * ─────────────────────
 * All core financial formulas for DailyBudget.
 * Keeping these pure functions separate makes it trivial to:
 *   1. Unit-test them in isolation.
 *   2. Replace localStorage calls with API calls later.
 */

// ─── Date helpers ────────────────────────────────────────────────────────────

/** Returns the number of days in the given month (1-indexed month). */
export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate(); // month is 1-12, day 0 = last day of previous month
}

/** Returns today's date as "YYYY-MM-DD". */
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the number of days remaining in the current month (including today). */
export function daysRemainingInMonth() {
  const now = new Date();
  const total = daysInMonth(now.getFullYear(), now.getMonth() + 1);
  return total - now.getDate() + 1;
}

/** Returns the current month as "YYYY-MM". */
export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Budget core ──────────────────────────────────────────────────────────────

/**
 * Resolves savings goal to an absolute ₹ amount.
 *   savingsType: 'amount' → use value directly
 *   savingsType: 'percent' → calculate % of salary
 */
export function resolveSavingsGoal(salary, savingsGoalValue, savingsGoalType) {
  if (savingsGoalType === 'percent') {
    return (salary * savingsGoalValue) / 100;
  }
  return savingsGoalValue;
}

/**
 * DAILY BUDGET FORMULA
 * ─────────────────────
 *   dailyBudget = (salary − savingsGoal − totalFixedExpenses) ÷ daysInMonth
 *
 * @param {number} salary          - Monthly take-home salary (₹)
 * @param {number} savingsGoal     - Resolved savings amount (₹)
 * @param {number} fixedExpenses   - Sum of all fixed monthly costs (rent, EMI, etc.)
 * @param {number} totalDays       - Total days in the current month
 * @returns {number} daily spending budget in ₹
 */
export function computeDailyBudget(salary, savingsGoal, fixedExpenses, totalDays) {
  const spendable = salary - savingsGoal - fixedExpenses;
  if (spendable <= 0 || totalDays <= 0) return 0;
  return spendable / totalDays;
}

/**
 * WALLET BALANCE FORMULA
 * ───────────────────────
 * Wallet = total spendable money for the month − all expenses logged so far.
 *   spendable = salary − savingsGoal − fixedExpenses
 *
 * @param {number} salary
 * @param {number} savingsGoal  - Resolved ₹ amount
 * @param {number} fixedExpenses
 * @param {Array}  expenses     - All expense objects { amount, date }
 * @param {string} monthKey     - "YYYY-MM" to filter expenses for this month only
 */
export function computeWalletBalance(salary, savingsGoal, fixedExpenses, expenses, monthKey) {
  const spendable = salary - savingsGoal - fixedExpenses;
  const monthlySpent = expenses
    .filter((e) => e.date.startsWith(monthKey))
    .reduce((sum, e) => sum + e.amount, 0);
  return spendable - monthlySpent;
}

/**
 * SAVINGS SO FAR
 * ───────────────
 * = salary − fixedExpenses − total spent this month
 * Tells the user how much they've effectively "saved" relative to their full spendable pool.
 */
export function computeSavingsSoFar(salary, fixedExpenses, expenses, monthKey) {
  const spent = expenses
    .filter((e) => e.date.startsWith(monthKey))
    .reduce((sum, e) => sum + e.amount, 0);
  return salary - fixedExpenses - spent;
}

// ─── Today ───────────────────────────────────────────────────────────────────

/**
 * Returns the total ₹ spent on a specific date.
 * @param {Array}  expenses - all expense objects
 * @param {string} dateStr  - "YYYY-MM-DD"
 */
export function getTodaySpent(expenses, dateStr) {
  return expenses
    .filter((e) => e.date === dateStr)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * TODAY'S REMAINING BUDGET (with optional rollover)
 * ───────────────────────────────────────────────────
 * Base: today's budget − today's spending
 *
 * With rollover ON (mode = 'rollover'):
 *   Accumulate the daily budget for every past day this month.
 *   Subtract all expenses so far this month.
 *   The result is today's effective remaining budget.
 *
 * With rollover OFF (mode = 'savings'):
 *   Each day is independent: todayBudget − todaySpent.
 *
 * If overspent on past days, the overage is spread over remaining days:
 *   adjustedDailyBudget = baseDailyBudget − (overage ÷ daysLeft)
 */
export function computeTodayRemaining(expenses, dailyBudget, rolloverMode, monthKey) {
  const now = new Date();
  const todayStr_ = todayStr();
  const dayOfMonth = now.getDate();

  if (rolloverMode === 'rollover') {
    // Budget accrued from day 1 up to and including today
    const budgetAccrued = dailyBudget * dayOfMonth;
    const monthSpent = expenses
      .filter((e) => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + e.amount, 0);
    return budgetAccrued - monthSpent;
  } else {
    // Savings mode: just today
    const todaySpent = getTodaySpent(expenses, todayStr_);
    return dailyBudget - todaySpent;
  }
}

// ─── Overspend adjustment ─────────────────────────────────────────────────────

/**
 * ADJUSTED DAILY BUDGET (overspend redistribution)
 * ──────────────────────────────────────────────────
 * If the user overspent in past days (savings mode), reduce remaining days' budgets:
 *   overage = sum of (daySpent − dailyBudget) for past overspent days
 *   adjustedBudget = dailyBudget − (overage ÷ daysRemaining)
 *
 * @returns {number} adjusted daily budget for remaining days
 */
export function computeAdjustedDailyBudget(expenses, dailyBudget, monthKey) {
  const now = new Date();
  const todayDate = now.getDate();
  const daysLeft = daysRemainingInMonth(); // includes today

  // Group expenses by day for past days only
  const pastDays = {};
  expenses
    .filter((e) => {
      if (!e.date.startsWith(monthKey)) return false;
      const day = parseInt(e.date.split('-')[2], 10);
      return day < todayDate;
    })
    .forEach((e) => {
      const day = e.date.split('-')[2];
      pastDays[day] = (pastDays[day] || 0) + e.amount;
    });

  const overage = Object.values(pastDays).reduce((sum, spent) => {
    const over = spent - dailyBudget;
    return over > 0 ? sum + over : sum;
  }, 0);

  if (overage <= 0 || daysLeft <= 0) return dailyBudget;
  return dailyBudget - overage / daysLeft;
}

// ─── Calendar / per-day stats ─────────────────────────────────────────────────

/**
 * Returns an array of per-day objects for the current month's calendar.
 * Each object: { day: number, spent: number, budget: number, status: 'under'|'over'|'empty' }
 */
export function getMonthDayStats(expenses, dailyBudget, year, month) {
  const totalDays = daysInMonth(year, month);
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const today = new Date();

  const dayMap = {};
  expenses
    .filter((e) => e.date.startsWith(monthKey))
    .forEach((e) => {
      const day = parseInt(e.date.split('-')[2], 10);
      dayMap[day] = (dayMap[day] || 0) + e.amount;
    });

  return Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const isPast = day < today.getDate() || (today.getMonth() + 1 !== month) || (today.getFullYear() !== year);
    const isToday = day === today.getDate() && today.getMonth() + 1 === month && today.getFullYear() === year;
    const spent = dayMap[day] || 0;
    let status = 'empty';
    if (isPast || isToday) {
      status = spent > dailyBudget ? 'over' : 'under';
    }
    return { day, spent, budget: dailyBudget, status };
  });
}

// ─── Insights ─────────────────────────────────────────────────────────────────

/**
 * Groups expenses by category and returns an array of { name, value } for Recharts.
 */
export function getCategoryBreakdown(expenses, monthKey) {
  const map = {};
  expenses
    .filter((e) => e.date.startsWith(monthKey))
    .forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/**
 * Returns payment-mode split for the current month.
 * e.g. [{ name: 'UPI', value: 4500 }, { name: 'Cash', value: 1200 }, ...]
 */
export function getModeSplit(expenses, monthKey) {
  const map = {};
  expenses
    .filter((e) => e.date.startsWith(monthKey))
    .forEach((e) => {
      map[e.mode] = (map[e.mode] || 0) + e.amount;
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/**
 * Returns the last 7 days of spending as [{ day: 'Mon', spent: number }, ...]
 */
export function getWeeklyTrend(expenses) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const spent = expenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    days.push({ day: dayLabel, spent });
  }
  return days;
}

/**
 * Generates a simple spending tip based on weekly trend data.
 */
export function generateTip(weeklyTrend) {
  if (!weeklyTrend.length) return null;
  const weekendDays = ['Sat', 'Sun'];
  const weekendSpend = weeklyTrend
    .filter((d) => weekendDays.includes(d.day))
    .reduce((s, d) => s + d.spent, 0);
  const weekdaySpend = weeklyTrend
    .filter((d) => !weekendDays.includes(d.day))
    .reduce((s, d) => s + d.spent, 0) / 5;

  if (weekendSpend / 2 > weekdaySpend * 1.5) {
    return '💡 You tend to overspend on weekends. Try setting a weekend limit.';
  }
  const max = weeklyTrend.reduce((a, b) => (a.spent > b.spent ? a : b));
  if (max.spent > 0) {
    return `💡 You spent the most on ${max.day}. Plan ahead for that day.`;
  }
  return '💡 Great job keeping your spending consistent this week!';
}

// ─── No-spend streak ─────────────────────────────────────────────────────────

/**
 * Counts consecutive no-spend days ending today (going backwards).
 */
export function getNoSpendStreak(expenses) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const spent = expenses.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
    if (spent === 0) {
      streak++;
    } else {
      break; // streak broken
    }
  }
  return streak;
}
