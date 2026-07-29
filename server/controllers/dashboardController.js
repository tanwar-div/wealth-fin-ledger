const asyncHandler = require('express-async-handler');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Asset = require('../models/Asset');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');

// @desc    Summary numbers + recent activity for the main dashboard
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [incomes, expenses, assets, habits, goals] = await Promise.all([
    Income.find({ userId }),
    Expense.find({ userId }),
    Asset.find({ userId }),
    Habit.find({ userId, isActive: true }),
    SavingsGoal.find({ userId, status: 'active' }),
  ]);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = totalIncome - totalExpenses;

  const totalAssets = assets.filter((a) => !a.isLiability).reduce((s, a) => s + a.value, 0);
  const totalLiabilities = assets.filter((a) => a.isLiability).reduce((s, a) => s + a.value, 0);
  const netWorth = totalSavings + totalAssets - totalLiabilities;

  const monthIncome = incomes.filter((i) => i.date >= monthStart).reduce((s, i) => s + i.amount, 0);
  const monthExpenses = expenses.filter((e) => e.date >= monthStart).reduce((s, e) => s + e.amount, 0);

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  const recentTransactions = [
    ...incomes.map((i) => ({ type: 'income', label: i.source, amount: i.amount, date: i.date })),
    ...expenses.map((e) => ({ type: 'expense', label: e.category, amount: e.amount, date: e.date })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const goalsProgress = goals.map((g) => ({
    id: g._id,
    goalName: g.goalName,
    percentComplete: g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      income: totalIncome,
      expenses: totalExpenses,
      savings: totalSavings,
      netWorth,
      currentMonthIncome: monthIncome,
      currentMonthExpenses: monthExpenses,
      bestStreak,
      activeHabits: habits.length,
      recentTransactions,
      goalsProgress,
    },
  });
});

// @desc    Time-series & breakdown data for the Wealth Analytics charts page
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [incomes, expenses, assets] = await Promise.all([
    Income.find({ userId }),
    Expense.find({ userId }),
    Asset.find({ userId }),
  ]);

  // Build last-12-months buckets
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }), income: 0, expenses: 0 });
  }
  const monthIndex = Object.fromEntries(months.map((m, idx) => [m.key, idx]));

  incomes.forEach((i) => {
    const key = `${new Date(i.date).getFullYear()}-${new Date(i.date).getMonth()}`;
    if (key in monthIndex) months[monthIndex[key]].income += i.amount;
  });
  expenses.forEach((e) => {
    const key = `${new Date(e.date).getFullYear()}-${new Date(e.date).getMonth()}`;
    if (key in monthIndex) months[monthIndex[key]].expenses += e.amount;
  });

  const totalAssets = assets.filter((a) => !a.isLiability).reduce((s, a) => s + a.value, 0);
  const totalLiabilities = assets.filter((a) => a.isLiability).reduce((s, a) => s + a.value, 0);

  let runningNetWorth = 0;
  const netWorthGrowth = months.map((m) => {
    runningNetWorth += m.income - m.expenses;
    return { month: m.label, netWorth: runningNetWorth + totalAssets - totalLiabilities };
  });

  let runningSavings = 0;
  const savingsGrowth = months.map((m) => {
    runningSavings += m.income - m.expenses;
    return { month: m.label, savings: runningSavings };
  });

  const expenseBreakdown = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([category, value]) => ({ category, value }));

  const incomeBreakdown = Object.entries(
    incomes.reduce((acc, i) => {
      acc[i.source] = (acc[i.source] || 0) + i.amount;
      return acc;
    }, {})
  ).map(([source, value]) => ({ source, value }));

  const monthlyCashFlow = months.map((m) => ({ month: m.label, income: m.income, expenses: m.expenses, net: m.income - m.expenses }));

  res.status(200).json({
    success: true,
    data: { netWorthGrowth, savingsGrowth, expenseBreakdown, incomeBreakdown, monthlyCashFlow },
  });
});

module.exports = { getDashboard, getAnalytics };
