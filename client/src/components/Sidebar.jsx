import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Flame,
  Target,
  TrendingUp,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', label: 'Income', icon: ArrowUpCircle },
  { to: '/expenses', label: 'Expenses', icon: ArrowDownCircle },
  { to: '/habits', label: 'Habits', icon: Flame },
  { to: '/goals', label: 'Savings Goals', icon: Target },
  { to: '/analytics', label: 'Wealth Analytics', icon: TrendingUp },
];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-display text-xl leading-none">Wealth Ledger</p>
        <p className="text-xs text-gold-light mt-1 tracking-wide">Habit Builder &amp; Growth Tracker</p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive ? 'bg-white/10 text-gold-light font-medium' : 'text-paper/80 hover:bg-white/5 hover:text-paper'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive ? 'bg-white/10 text-gold-light font-medium' : 'text-paper/80 hover:bg-white/5 hover:text-paper'
              }`
            }
          >
            <ShieldCheck size={17} strokeWidth={1.75} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 pb-3">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-paper/60 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-paper/80 hover:bg-white/5 hover:text-paper transition-colors"
        >
          <LogOut size={17} strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}
