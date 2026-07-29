// Signature visual: a 14-period "stamp row" showing which recent days/weeks/
// months a habit was completed, styled like ink stamps in a ledger margin.
const periodsBack = (frequency, n, from = new Date()) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(from);
    if (frequency === 'weekly') d.setDate(d.getDate() - i * 7);
    else if (frequency === 'monthly') d.setMonth(d.getMonth() - i);
    else d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
};

const sameBucket = (a, b, frequency) => {
  const da = new Date(a);
  const db = new Date(b);
  if (frequency === 'monthly') return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
  if (frequency === 'weekly') {
    const startOfWeek = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      x.setDate(x.getDate() - x.getDay());
      return x.getTime();
    };
    return startOfWeek(da) === startOfWeek(db);
  }
  return da.toDateString() === db.toDateString();
};

export default function StreakStrip({ frequency, completedDates = [], count = 14 }) {
  const buckets = periodsBack(frequency, count);

  return (
    <div className="flex gap-1" aria-label={`Last ${count} ${frequency} periods`}>
      {buckets.map((bucket, idx) => {
        const done = completedDates.some((d) => sameBucket(d, bucket, frequency));
        return (
          <span
            key={idx}
            title={bucket.toLocaleDateString()}
            className={`w-2.5 h-4 rounded-[2px] ${done ? 'bg-growth' : 'bg-line'}`}
          />
        );
      })}
    </div>
  );
}
