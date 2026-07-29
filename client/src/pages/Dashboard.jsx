import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Wallet, TrendingDown, PiggyBank, Landmark, Flame, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import Money from '../components/Money';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const chartTickStyle = { fontSize: 12, fill: '#55645C', fontFamily: 'Inter' };

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([dashboardApi.summary(), dashboardApi.analytics()])
      .then(([s, a]) => {
        setSummary(s.data);
        setAnalytics(a.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><Loader fullScreen={false} /></Layout>;

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="card p-6 text-rust text-sm">{error}</div>
      </Layout>
    );
  }

  const last6Months = analytics.monthlyCashFlow.slice(-6);

  return (
    <Layout title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Here's where your money and habits stand today.">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Income" value={summary.income} icon={Wallet} />
        <StatCard label="Total Expenses" value={summary.expenses} icon={TrendingDown} />
        <StatCard label="Total Savings" value={summary.savings} icon={PiggyBank} tone="growth" />
        <StatCard label="Net Worth" value={summary.netWorth} icon={Landmark} tone="growth" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <span className="eyebrow">This month</span>
          <div className="mt-2 flex items-baseline gap-2">
            <ArrowUpRight size={16} className="text-growth" />
            <span className="text-sm text-ink2">Income</span>
            <Money value={summary.currentMonthIncome} className="ml-auto text-ink font-medium" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <ArrowDownRight size={16} className="text-rust" />
            <span className="text-sm text-ink2">Spending</span>
            <Money value={summary.currentMonthExpenses} className="ml-auto text-ink font-medium" />
          </div>
        </div>

        <div className="card p-5 flex flex-col justify-center">
          <span className="eyebrow flex items-center gap-1.5">
            <Flame size={14} className="text-gold-dark" /> Best Habit Streak
          </span>
          <p className="font-display text-3xl text-ink mt-2">{summary.bestStreak} days</p>
          <p className="text-xs text-ink2 mt-1">{summary.activeHabits} active habit{summary.activeHabits === 1 ? '' : 's'}</p>
        </div>

        <div className="card p-5">
          <span className="eyebrow">Savings goals in progress</span>
          <div className="mt-3 space-y-3">
            {summary.goalsProgress.length === 0 && <p className="text-sm text-ink2">No active goals yet.</p>}
            {summary.goalsProgress.slice(0, 2).map((g) => (
              <div key={g.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink">{g.goalName}</span>
                  <span className="text-ink2 font-mono">{g.percentComplete}%</span>
                </div>
                <ProgressBar percent={g.percentComplete} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Income vs. Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last6Months}>
              <CartesianGrid vertical={false} stroke="#E3DFD2" />
              <XAxis dataKey="month" tick={chartTickStyle} axisLine={{ stroke: '#E3DFD2' }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13, fontFamily: 'Inter' }}
                formatter={(v) => [`$${v.toLocaleString()}`, undefined]}
              />
              <Bar dataKey="income" fill="#3E8367" radius={[3, 3, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#9A4530" radius={[3, 3, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Net Worth Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.netWorthGrowth}>
              <defs>
                <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A15A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C9A15A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E3DFD2" />
              <XAxis dataKey="month" tick={chartTickStyle} axisLine={{ stroke: '#E3DFD2' }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13, fontFamily: 'Inter' }}
                formatter={(v) => [`$${v.toLocaleString()}`, 'Net worth']}
              />
              <Area type="monotone" dataKey="netWorth" stroke="#A9813F" strokeWidth={2} fill="url(#netWorthFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink">Recent Transactions</h3>
          <div className="flex gap-2">
            <Link to="/income" className="btn-secondary text-xs px-3 py-1.5"><Plus size={14} /> Income</Link>
            <Link to="/expenses" className="btn-secondary text-xs px-3 py-1.5"><Plus size={14} /> Expense</Link>
          </div>
        </div>
        {summary.recentTransactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Add your first income or expense to see it here." />
        ) : (
          <div className="divide-y divide-line">
            {summary.recentTransactions.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-growth/10' : 'bg-rust/10'}`}>
                    {t.type === 'income' ? (
                      <ArrowUpRight size={15} className="text-growth" />
                    ) : (
                      <ArrowDownRight size={15} className="text-rust" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-ink font-medium">{t.label}</p>
                    <p className="text-xs text-ink2">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <Money value={t.amount} className={`text-sm font-medium ${t.type === 'income' ? 'text-growth' : 'text-rust'}`} sign />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
