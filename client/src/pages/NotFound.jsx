import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="text-center">
        <p className="font-display text-6xl text-ink mb-2">404</p>
        <p className="text-ink2 mb-6">This page doesn't exist in the ledger.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">Back to dashboard</Link>
      </div>
    </div>
  );
}
