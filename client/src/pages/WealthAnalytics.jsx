import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { dashboardApi } from '../services/api';

const chartTickStyle = { fontSize: 12, fill: '#55645C', fontFamily: 'Inter' };
const PALETTE = ['#12362B', '#3E8367', '#C9A15A', '#9A4530', '#55645C', '#A9813F', '#1B4A3A', '#DCC08B'];

export default function WealthAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .analytics()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <Layout title="Wealth Analytics">
        <div className="card p-6 text-rust text-sm">{error}</div>
      </Layout>
    );
  }
  if (!data) return <Layout title="Wealth Analytics"><Loader /></Layout>;

  const hasExpenses = data.expenseBreakdown.length > 0;
  const hasIncome = data.incomeBreakdown.length > 0;

  return (
    <Layout title="Wealth Analytics" subtitle="The full picture of how your money is moving, over the last 12 months.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Net Worth Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.netWorthGrowth}>
              <CartesianGrid vertical={false} stroke="#E3DFD2" />
              <XAxis dataKey="month" tick={chartTickStyle} axisLine={{ stroke: '#E3DFD2' }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, 'Net worth']} />
              <Line type="monotone" dataKey="netWorth" stroke="#12362B" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Savings Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.savingsGrowth}>
              <CartesianGrid vertical={false} stroke="#E3DFD2" />
              <XAxis dataKey="month" tick={chartTickStyle} axisLine={{ stroke: '#E3DFD2' }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, 'Savings']} />
              <Line type="monotone" dataKey="savings" stroke="#3E8367" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Expense Breakdown</h3>
          {hasExpenses ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.expenseBreakdown} dataKey="value" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.expenseBreakdown.map((entry, idx) => (
                    <Cell key={entry.category} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink2 py-16 text-center">No expense data yet.</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Income Sources</h3>
          {hasIncome ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.incomeBreakdown} dataKey="value" nameKey="source" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.incomeBreakdown.map((entry, idx) => (
                    <Cell key={entry.source} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink2 py-16 text-center">No income data yet.</p>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-lg text-ink mb-4">Monthly Cash Flow</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyCashFlow}>
              <CartesianGrid vertical={false} stroke="#E3DFD2" />
              <XAxis dataKey="month" tick={chartTickStyle} axisLine={{ stroke: '#E3DFD2' }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E3DFD2', fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
              <Bar dataKey="income" fill="#3E8367" radius={[3, 3, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#9A4530" radius={[3, 3, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
