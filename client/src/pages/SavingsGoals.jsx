import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Target, Trash2, PiggyBank } from 'lucide-react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import Money from '../components/Money';
import { goalApi } from '../services/api';

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const contributeForm = useForm();

  const load = useCallback(() => {
    setLoading(true);
    goalApi
      .list()
      .then((res) => setGoals(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    reset({ goalName: '', targetAmount: '', currentAmount: '', deadline: '' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      await goalApi.create({
        ...data,
        targetAmount: Number(data.targetAmount),
        currentAmount: Number(data.currentAmount) || 0,
        deadline: data.deadline || undefined,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const openContribute = (goal) => {
    contributeForm.reset({ amount: '' });
    setContributeGoal(goal);
  };

  const onContribute = async (data) => {
    try {
      const newAmount = contributeGoal.currentAmount + Number(data.amount);
      await goalApi.update(contributeGoal._id, { currentAmount: newAmount });
      setContributeGoal(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await goalApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const estimateCompletion = (goal) => {
    if (goal.status === 'completed') return 'Completed';
    if (!goal.deadline) return 'No deadline set';
    const days = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Deadline passed';
    return `${days} day${days === 1 ? '' : 's'} left`;
  };

  return (
    <Layout
      title="Savings Goals"
      subtitle="Give your savings a destination."
      actions={
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> New Goal
        </button>
      }
    >
      {error && <div className="mb-4 text-sm text-rust bg-rust/5 border border-rust/20 rounded-md px-3 py-2.5">{error}</div>}

      {loading ? (
        <Loader />
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            description="Create a goal like an Emergency Fund or Vacation Fund and track your progress toward it."
            action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> New Goal</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => (
            <div key={g._id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-ink font-medium">{g.goalName}</p>
                  <p className="text-xs text-ink2">{estimateCompletion(g)}</p>
                </div>
                <button
                  onClick={() => handleDelete(g._id)}
                  disabled={busyId === g._id}
                  className="p-1.5 text-ink2 hover:text-rust rounded disabled:opacity-40"
                  aria-label="Delete goal"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <Money value={g.currentAmount} className="text-xl font-display text-ink" />
                <span className="text-sm text-ink2">of <Money value={g.targetAmount} /></span>
              </div>
              <ProgressBar percent={g.percentComplete} tone={g.status === 'completed' ? 'gold' : 'growth'} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-ink2">{g.percentComplete}% complete</span>
                <span className="text-xs text-ink2">Remaining: <Money value={g.remaining} /></span>
              </div>

              {g.status !== 'completed' && (
                <button onClick={() => openContribute(g)} className="btn-secondary mt-4 text-sm py-2">
                  <PiggyBank size={15} /> Add contribution
                </button>
              )}
              {g.status === 'completed' && (
                <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gold-dark bg-gold/10 rounded-md py-2">
                  🎉 Goal reached
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Savings Goal">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Goal name</label>
            <input
              className="input-field"
              placeholder="e.g. Emergency Fund"
              {...register('goalName', { required: 'Goal name is required' })}
            />
            {errors.goalName && <p className="text-xs text-rust mt-1">{errors.goalName.message}</p>}
          </div>
          <div>
            <label className="label-text">Target amount</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="5000"
              {...register('targetAmount', { required: 'Target amount is required', min: { value: 1, message: 'Must be positive' } })}
            />
            {errors.targetAmount && <p className="text-xs text-rust mt-1">{errors.targetAmount.message}</p>}
          </div>
          <div>
            <label className="label-text">Starting amount (optional)</label>
            <input type="number" step="0.01" className="input-field" placeholder="0" {...register('currentAmount')} />
          </div>
          <div>
            <label className="label-text">Target date (optional)</label>
            <input type="date" className="input-field" {...register('deadline')} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating…' : 'Create goal'}
          </button>
        </form>
      </Modal>

      <Modal open={!!contributeGoal} onClose={() => setContributeGoal(null)} title={`Add to "${contributeGoal?.goalName}"`}>
        <form onSubmit={contributeForm.handleSubmit(onContribute)} className="space-y-4">
          <div>
            <label className="label-text">Contribution amount</label>
            <input
              type="number"
              step="0.01"
              autoFocus
              className="input-field"
              placeholder="100"
              {...contributeForm.register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
            />
            {contributeForm.formState.errors.amount && (
              <p className="text-xs text-rust mt-1">{contributeForm.formState.errors.amount.message}</p>
            )}
          </div>
          <button type="submit" disabled={contributeForm.formState.isSubmitting} className="btn-primary w-full">
            Add contribution
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
