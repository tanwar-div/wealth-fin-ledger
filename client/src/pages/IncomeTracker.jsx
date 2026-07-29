import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Money from '../components/Money';
import { incomeApi } from '../services/api';

const SOURCES = ['Salary', 'Freelance', 'Scholarship', 'Investments', 'Gifts', 'Business', 'Other'];

export default function IncomeTracker() {
  const [incomes, setIncomes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    incomeApi
      .list(sourceFilter ? { source: sourceFilter } : {})
      .then((res) => {
        setIncomes(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sourceFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    reset({ source: 'Salary', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    setModalOpen(true);
  };

  const openEdit = (income) => {
    setEditing(income);
    reset({
      source: income.source,
      amount: income.amount,
      date: new Date(income.date).toISOString().slice(0, 10),
      notes: income.notes || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, amount: Number(data.amount) };
      if (editing) await incomeApi.update(editing._id, payload);
      else await incomeApi.create(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await incomeApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout
      title="Income Tracker"
      subtitle={`Total tracked: ${total ? '' : '$0'}`}
      actions={
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Income
        </button>
      }
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink2">Filter by source:</span>
          <select
            className="input-field w-auto py-2"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All sources</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="card px-4 py-2">
          <span className="text-xs text-ink2 mr-2">Total</span>
          <Money value={total} className="text-ink font-semibold" />
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-rust bg-rust/5 border border-rust/20 rounded-md px-3 py-2.5">{error}</div>}

      <div className="card overflow-hidden">
        {loading ? (
          <Loader />
        ) : incomes.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No income recorded yet"
            description="Log your salary, freelance work, or any other income to start tracking your growth."
            action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Income</button>}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-medium text-ink2">Source</th>
                <th className="px-5 py-3 font-medium text-ink2">Date</th>
                <th className="px-5 py-3 font-medium text-ink2">Notes</th>
                <th className="px-5 py-3 font-medium text-ink2 text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-ink2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {incomes.map((i) => (
                <tr key={i._id} className="hover:bg-paper/50 transition-colors">
                  <td className="px-5 py-3 text-ink font-medium">{i.source}</td>
                  <td className="px-5 py-3 text-ink2">{new Date(i.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-ink2 max-w-xs truncate">{i.notes || '—'}</td>
                  <td className="px-5 py-3 text-right"><Money value={i.amount} className="text-growth font-medium" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(i)} className="p-1.5 text-ink2 hover:text-ink rounded" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(i._id)}
                        disabled={deletingId === i._id}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Source</label>
            <select className="input-field" {...register('source', { required: true })}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
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
            <label className="label-text">Notes (optional)</label>
            <textarea rows={2} className="input-field resize-none" {...register('notes')} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add income'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
