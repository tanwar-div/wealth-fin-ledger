import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-dark/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line">
          <div className="px-5 md:px-8 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden p-1.5 -ml-1.5 text-ink"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-2xl text-ink truncate">{title}</h1>
                {subtitle && <p className="text-sm text-ink2 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 px-5 md:px-8 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
