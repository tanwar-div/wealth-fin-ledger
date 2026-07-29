import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Money from '../components/Money';
import ProgressBar from '../components/ProgressBar';
import { expenseApi } from '../services/api';

const CATEGORIES = ['Food', 'Rent', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Health', 'Others'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    expenseApi
      .list(categoryFilter ? { category: categoryFilter } : {})
      .then((res) => {
        setExpenses(res.data);
        setTotal(res.total);
        setByCategory(res.byCategory);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    reset({ category: 'Food', amount: '', date: new Date().toISOString().slice(0, 10), description: '' });
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setEditing(expense);
    reset({
      category: expense.category,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().slice(0, 10),
      description: expense.description || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, amount: Number(data.amount) };
      if (editing) await expenseApi.update(editing._id, payload);
      else await expenseApi.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await expenseApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCategoryAmount = categoryEntries.length ? categoryEntries[0][1] : 1;

  return (
    <Layout
      title="Expense Tracker"
      subtitle="Log spending and see where it's going."
      actions={
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Expense
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-wrap gap-3">
            <select
              className="input-field w-auto py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div>
              <span className="text-xs text-ink2 mr-2">Total</span>
              <Money value={total} className="text-ink font-semibold" />
            </div>
          </div>

          {error && <div className="m-4 text-sm text-rust bg-rust/5 border border-rust/20 rounded-md px-3 py-2.5">{error}</div>}

          {loading ? (
            <Loader />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add your daily spending to see category breakdowns and monthly reports."
              action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Expense</button>}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-5 py-3 font-medium text-ink2">Category</th>
                  <th className="px-5 py-3 font-medium text-ink2">Date</th>
                  <th className="px-5 py-3 font-medium text-ink2">Description</th>
                  <th className="px-5 py-3 font-medium text-ink2 text-right">Amount</th>
                  <th className="px-5 py-3 font-medium text-ink2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-paper/50 transition-colors">
                    <td className="px-5 py-3 text-ink font-medium">{e.category}</td>
                    <td className="px-5 py-3 text-ink2">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-ink2 max-w-xs truncate">{e.description || '—'}</td>
                    <td className="px-5 py-3 text-right"><Money value={e.amount} className="text-rust font-medium" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-ink2 hover:text-ink rounded" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(e._id)}
                          disabled={deletingId === e._id}
                          className="p-1.5 text-ink2 hover:text-rust rounded disabled:opacity-40"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">By Category</h3>
          {categoryEntries.length === 0 ? (
            <p className="text-sm text-ink2">No data yet.</p>
          ) : (
            <div className="space-y-3.5">
              {categoryEntries.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink">{cat}</span>
                    <Money value={amt} className="text-ink2" />
                  </div>
                  <ProgressBar percent={(amt / maxCategoryAmount) * 100} tone="rust" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" {...register('category', { required: true })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Amount</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="0.00"
              {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
            />
            {errors.amount && <p className="text-xs text-rust mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="label-text">Date</label>
            <input type="date" className="input-field" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="label-text">Description (optional)</label>
            <textarea rows={2} className="input-field resize-none" {...register('description')} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
