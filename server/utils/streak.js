// Streak calculation helpers for habit tracking.
// A habit's streak counts consecutive completed periods (day/week/month)
// with no gaps. Marking today complete extends the streak only if the
// previous completion was exactly one period before today.

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfWeek = (d) => {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Sunday
  x.setDate(x.getDate() - day);
  return x;
};

const startOfMonth = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), 1);
};

const periodStart = (date, frequency) => {
  if (frequency === 'weekly') return startOfWeek(date);
  if (frequency === 'monthly') return startOfMonth(date);
  return startOfDay(date);
};

const previousPeriodStart = (periodStartDate, frequency) => {
  const x = new Date(periodStartDate);
  if (frequency === 'weekly') x.setDate(x.getDate() - 7);
  else if (frequency === 'monthly') x.setMonth(x.getMonth() - 1);
  else x.setDate(x.getDate() - 1);
  return x;
};

// Returns { alreadyCompleted, currentStreak, bestStreak }
const applyCompletion = (habit, completionDate = new Date()) => {
  const frequency = habit.frequency;
  const todayPeriod = periodStart(completionDate, frequency);

  const alreadyCompleted = (habit.completedDates || []).some(
    (d) => periodStart(d, frequency).getTime() === todayPeriod.getTime()
  );

  if (alreadyCompleted) {
    return { alreadyCompleted: true, currentStreak: habit.currentStreak, bestStreak: habit.bestStreak };
  }

  const lastCompleted = (habit.completedDates || [])
    .map((d) => periodStart(d, frequency))
    .sort((a, b) => b - a)[0];

  const expectedPrevious = previousPeriodStart(todayPeriod, frequency);

  let currentStreak;
  if (lastCompleted && lastCompleted.getTime() === expectedPrevious.getTime()) {
    currentStreak = habit.currentStreak + 1;
  } else {
    currentStreak = 1; // gap in the streak, or first ever completion
  }

  const bestStreak = Math.max(habit.bestStreak || 0, currentStreak);

  return { alreadyCompleted: false, currentStreak, bestStreak };
};

module.exports = { periodStart, applyCompletion };
