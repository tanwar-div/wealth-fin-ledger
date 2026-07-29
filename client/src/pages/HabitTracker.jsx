import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Flame, Check, SkipForward, Trash2, Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StreakStrip from '../components/StreakStrip';
import { habitApi } from '../services/api';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { title: '', frequency: 'daily' } });

  const load = useCallback(() => {
    setLoading(true);
    habitApi
      .list()
      .then((res) => setHabits(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    reset({ title: '', frequency: 'daily' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      await habitApi.create(data);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComplete = async (id) => {
    setBusyId(id);
    try {
      await habitApi.complete(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleSkip = async (id) => {
    setBusyId(id);
    try {
      await habitApi.skip(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await habitApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const isCompletedThisPeriod = (habit) => {
    if (!habit.completedDates?.length) return false;
    const last = new Date(habit.completedDates[habit.completedDates.length - 1]);
    const now = new Date();
    if (habit.frequency === 'monthly') return last.getFullYear() === now.getFullYear() && last.getMonth() === now.getMonth();
    if (habit.frequency === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return last >= start;
    }
    return last.toDateString() === now.toDateString();
  };

  return (
    <Layout
      title="Habit Tracker"
      subtitle="Small, repeated actions compound into real wealth."
      actions={
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> New Habit
        </button>
      }
    >
      {error && <div className="mb-4 text-sm text-rust bg-rust/5 border border-rust/20 rounded-md px-3 py-2.5">{error}</div>}

      {loading ? (
        <Loader />
      ) : habits.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Flame}
            title="No habits set up yet"
            description="Create habits like 'Save Money Daily' or 'Track Expenses' and build a streak."
            action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> New Habit</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => {
            const done = isCompletedThisPeriod(h);
            return (
              <div key={h._id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-ink font-medium">{h.title}</p>
                    <p className="text-xs text-ink2 capitalize">{h.frequency}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(h._id)}
                    disabled={busyId === h._id}
                    className="p-1.5 text-ink2 hover:text-rust rounded disabled:opacity-40"
                    aria-label="Delete habit"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Flame size={16} className="text-gold-dark" />
                    <span className="font-mono text-sm text-ink">{h.currentStreak}</span>
                    <span className="text-xs text-ink2">current</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={15} className="text-ink2" />
                    <span className="font-mono text-sm text-ink">{h.bestStreak}</span>
                    <span className="text-xs text-ink2">best</span>
                  </div>
                </div>

                <StreakStrip frequency={h.frequency} completedDates={h.completedDates} />

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleComplete(h._id)}
                    disabled={done || busyId === h._id}
                    className="btn-primary flex-1 py-2 text-sm"
                  >
                    <Check size={15} /> {done ? 'Completed' : 'Complete Today'}
                  </button>
                  <button
                    onClick={() => handleSkip(h._id)}
                    disabled={busyId === h._id}
                    className="btn-secondary py-2 text-sm px-3"
                  >
                    <SkipForward size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Habit">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Habit name</label>
            <input
              className="input-field"
              placeholder="e.g. Save Money Daily"
              {...register('title', { required: 'Habit name is required' })}
            />
            {errors.title && <p className="text-xs text-rust mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label-text">Frequency</label>
            <select className="input-field" {...register('frequency', { required: true })}>
              {FREQUENCIES.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating…' : 'Create habit'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
