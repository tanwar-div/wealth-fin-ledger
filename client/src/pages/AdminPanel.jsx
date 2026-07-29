import { useEffect, useState, useCallback } from 'react';
import { Users, Receipt, Flame, MessageSquare, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { adminApi } from '../services/api';

const TABS = ['Users', 'Feedback'];

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('Users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([adminApi.stats(), adminApi.users(), adminApi.feedback()])
      .then(([s, u, f]) => {
        setStats(s.data);
        setUsers(u.data);
        setFeedback(f.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (user) => {
    setBusyId(user._id);
    try {
      await adminApi.updateUserStatus(user._id, user.status === 'active' ? 'suspended' : 'active');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (id) => {
    setBusyId(id);
    try {
      await adminApi.deleteUser(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const updateFeedback = async (id, status) => {
    setBusyId(id);
    try {
      await adminApi.updateFeedbackStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Layout title="Admin Panel"><Loader /></Layout>;

  return (
    <Layout title="Admin Panel" subtitle="Manage users and monitor platform-wide activity.">
      {error && <div className="mb-4 text-sm text-rust bg-rust/5 border border-rust/20 rounded-md px-3 py-2.5">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.totalUsers} isMoney={false} icon={Users} />
        <StatCard label="Active (30 days)" value={stats.activeUsersLast30Days} isMoney={false} icon={Users} tone="growth" />
        <StatCard label="Total Transactions" value={stats.totalTransactions} isMoney={false} icon={Receipt} />
        <StatCard label="Active Habits" value={stats.activeHabits} isMoney={false} icon={Flame} />
      </div>

      <div className="flex gap-1 mb-4 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink'
            }`}
          >
            {t} {t === 'Feedback' && stats.openFeedback > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs bg-rust/10 text-rust rounded-full">
                {stats.openFeedback}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'Users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-medium text-ink2">Name</th>
                <th className="px-5 py-3 font-medium text-ink2">Email</th>
                <th className="px-5 py-3 font-medium text-ink2">Role</th>
                <th className="px-5 py-3 font-medium text-ink2">Status</th>
                <th className="px-5 py-3 font-medium text-ink2">Joined</th>
                <th className="px-5 py-3 font-medium text-ink2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-paper/50">
                  <td className="px-5 py-3 text-ink font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-ink2">{u.email}</td>
                  <td className="px-5 py-3 text-ink2 capitalize">{u.role}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-growth/10 text-growth' : 'bg-rust/10 text-rust'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink2">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={busyId === u._id}
                          className="p-1.5 text-ink2 hover:text-ink rounded disabled:opacity-40"
                          aria-label={u.status === 'active' ? 'Suspend user' : 'Reactivate user'}
                          title={u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        >
                          {u.status === 'active' ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          onClick={() => removeUser(u._id)}
                          disabled={busyId === u._id}
                          className="p-1.5 text-ink2 hover:text-rust rounded disabled:opacity-40"
                          aria-label="Delete user"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Feedback' && (
        <div className="card">
          {feedback.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No feedback yet" description="User feedback and complaints will show up here." />
          ) : (
            <div className="divide-y divide-line">
              {feedback.map((f) => (
                <div key={f._id} className="p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-ink">{f.message}</p>
                    <p className="text-xs text-ink2 mt-1">
                      {f.userId?.name} · {new Date(f.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    value={f.status}
                    disabled={busyId === f._id}
                    onChange={(e) => updateFeedback(f._id, e.target.value)}
                    className="input-field w-auto py-1.5 text-xs shrink-0"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
