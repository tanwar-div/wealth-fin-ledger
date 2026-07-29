// Seed script: wipes and repopulates the database with realistic demo data.
// Run with:  npm run seed          (populate)
//            npm run seed:destroy  (wipe only)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Asset = require('../models/Asset');
const Feedback = require('../models/Feedback');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const monthsAgo = (n, day = 1) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  return d;
};

const run = async () => {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Promise.all([
      User.deleteMany(),
      Income.deleteMany(),
      Expense.deleteMany(),
      Habit.deleteMany(),
      SavingsGoal.deleteMany(),
      Asset.deleteMany(),
      Feedback.deleteMany(),
    ]);
    console.log('All data destroyed.');
    process.exit(0);
  }

  await Promise.all([
    User.deleteMany(),
    Income.deleteMany(),
    Expense.deleteMany(),
    Habit.deleteMany(),
    SavingsGoal.deleteMany(),
    Asset.deleteMany(),
    Feedback.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Priya Sharma',
    email: 'admin@fhb.com',
    password: 'Admin@123',
    role: 'admin',
  });

  const demoUser = await User.create({
    name: 'Arjun Mehta',
    email: 'demo@fhb.com',
    password: 'Demo@1234',
    role: 'user',
    currency: 'USD',
    monthlyIncomeTarget: 4500,
  });

  const secondUser = await User.create({
    name: 'Sara Lopez',
    email: 'sara@fhb.com',
    password: 'Sara@1234',
    role: 'user',
    currency: 'USD',
    monthlyIncomeTarget: 3200,
  });

  // ---- Income: 6 months of salary + occasional freelance for demoUser ----
  const incomeDocs = [];
  for (let m = 5; m >= 0; m -= 1) {
    incomeDocs.push({ userId: demoUser._id, source: 'Salary', amount: 4200, date: monthsAgo(m, 1), notes: 'Monthly salary' });
    if (m % 2 === 0) {
      incomeDocs.push({ userId: demoUser._id, source: 'Freelance', amount: 350 + m * 20, date: monthsAgo(m, 15), notes: 'Freelance project' });
    }
  }
  incomeDocs.push({ userId: demoUser._id, source: 'Gifts', amount: 150, date: daysAgo(20), notes: 'Birthday gift' });
  incomeDocs.push({ userId: demoUser._id, source: 'Investments', amount: 90, date: daysAgo(10), notes: 'Dividend payout' });
  await Income.insertMany(incomeDocs);

  // ---- Expenses: 6 months of realistic recurring + variable spend ----
  const categories = [
    { category: 'Rent', amount: 1400 },
    { category: 'Food', amount: 420 },
    { category: 'Bills', amount: 180 },
    { category: 'Travel', amount: 90 },
  ];
  const expenseDocs = [];
  for (let m = 5; m >= 0; m -= 1) {
    categories.forEach((c) => {
      expenseDocs.push({ userId: demoUser._id, category: c.category, amount: c.amount + Math.round(Math.random() * 40 - 20), date: monthsAgo(m, 3) });
    });
    expenseDocs.push({ userId: demoUser._id, category: 'Shopping', amount: 60 + Math.round(Math.random() * 120), date: monthsAgo(m, 18) });
    expenseDocs.push({ userId: demoUser._id, category: 'Entertainment', amount: 30 + Math.round(Math.random() * 60), date: monthsAgo(m, 22) });
    if (m === 3) expenseDocs.push({ userId: demoUser._id, category: 'Education', amount: 220, date: monthsAgo(m, 10), description: 'Online course' });
  }
  expenseDocs.push({ userId: demoUser._id, category: 'Food', amount: 38.5, date: daysAgo(1), description: 'Groceries' });
  expenseDocs.push({ userId: demoUser._id, category: 'Travel', amount: 22, date: daysAgo(2), description: 'Metro card top-up' });
  await Expense.insertMany(expenseDocs);

  // ---- Habits with realistic streak history ----
  const buildCompletedDates = (n) => Array.from({ length: n }, (_, i) => daysAgo(n - 1 - i));

  await Habit.create([
    { userId: demoUser._id, title: 'Save Money Daily', frequency: 'daily', currentStreak: 24, bestStreak: 31, completedDates: buildCompletedDates(24) },
    { userId: demoUser._id, title: 'No Impulse Buying', frequency: 'daily', currentStreak: 9, bestStreak: 15, completedDates: buildCompletedDates(9) },
    { userId: demoUser._id, title: 'Track All Expenses', frequency: 'daily', currentStreak: 41, bestStreak: 41, completedDates: buildCompletedDates(41) },
    { userId: demoUser._id, title: 'Review Budget', frequency: 'weekly', currentStreak: 6, bestStreak: 8, completedDates: [daysAgo(0), daysAgo(7), daysAgo(14), daysAgo(21), daysAgo(28), daysAgo(35)] },
    { userId: demoUser._id, title: 'Invest Monthly', frequency: 'monthly', currentStreak: 3, bestStreak: 3, completedDates: [monthsAgo(0, 2), monthsAgo(1, 2), monthsAgo(2, 2)] },
  ]);

  // ---- Savings goals ----
  await SavingsGoal.create([
    { userId: demoUser._id, goalName: 'Emergency Fund', targetAmount: 5000, currentAmount: 3600, deadline: monthsAgo(-6, 1) },
    { userId: demoUser._id, goalName: 'Vacation to Bali', targetAmount: 2000, currentAmount: 850, deadline: monthsAgo(-4, 1) },
    { userId: demoUser._id, goalName: 'New Laptop', targetAmount: 1500, currentAmount: 1500, deadline: monthsAgo(-1, 1), status: 'completed' },
  ]);

  // ---- Assets & liabilities ----
  await Asset.create([
    { userId: demoUser._id, type: 'Cash', name: 'Savings account', value: 3600 },
    { userId: demoUser._id, type: 'Mutual Funds', name: 'Index fund SIP', value: 2100 },
    { userId: demoUser._id, type: 'Stocks', name: 'Brokerage account', value: 1450 },
    { userId: demoUser._id, type: 'Gold', name: 'Digital gold', value: 300 },
    { userId: demoUser._id, type: 'Crypto', name: 'BTC/ETH holding', value: 500 },
    { userId: demoUser._id, type: 'Other', name: 'Student loan', value: 4000, isLiability: true },
  ]);

  await Feedback.create({ userId: demoUser._id, message: 'Would love a CSV export option for monthly reports.', status: 'open' });

  // A little data for the second user so the admin panel has multiple users to show
  await Income.create({ userId: secondUser._id, source: 'Salary', amount: 3200, date: monthsAgo(0, 1) });
  await Expense.create({ userId: secondUser._id, category: 'Rent', amount: 1100, date: monthsAgo(0, 3) });
  await Habit.create({ userId: secondUser._id, title: 'Save Money Daily', frequency: 'daily', currentStreak: 5, bestStreak: 5, completedDates: buildCompletedDates(5) });

  console.log('Seed data created successfully.');
  console.log('----------------------------------------');
  console.log('Admin login   -> admin@fhb.com / Admin@123');
  console.log('Demo user     -> demo@fhb.com  / Demo@1234');
  console.log('Second user   -> sara@fhb.com  / Sara@1234');
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
