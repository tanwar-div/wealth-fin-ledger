import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IncomeTracker from './pages/IncomeTracker';
import ExpenseTracker from './pages/ExpenseTracker';
import HabitTracker from './pages/HabitTracker';
import SavingsGoals from './pages/SavingsGoals';
import WealthAnalytics from './pages/WealthAnalytics';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income" element={<IncomeTracker />} />
        <Route path="/expenses" element={<ExpenseTracker />} />
        <Route path="/habits" element={<HabitTracker />} />
        <Route path="/goals" element={<SavingsGoals />} />
        <Route path="/analytics" element={<WealthAnalytics />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
