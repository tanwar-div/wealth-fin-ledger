import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center">
            <Leaf size={18} className="text-gold-light" strokeWidth={2} />
          </div>
          <span className="font-display text-xl text-ink">Wealth Ledger</span>
        </div>

        <div className="card p-7">
          <h1 className="font-display text-2xl text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-ink2 mb-6">Log in to keep your streak going.</p>

          {serverError && (
            <div className="mb-4 flex items-start gap-2 text-sm text-rust bg-rust/5 border border-rust/20 rounded-md px-3 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-xs text-rust mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label-text" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-xs text-rust mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-ink2 text-center mt-6">
            New here?{' '}
            <Link to="/register" className="text-ink font-medium hover:text-gold-dark underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-xs text-ink2 text-center mt-5">
          Demo login: <span className="font-mono">demo@fhb.com</span> / <span className="font-mono">Demo@1234</span>
        </p>
      </div>
    </div>
  );
}
