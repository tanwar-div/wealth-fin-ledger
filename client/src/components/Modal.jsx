import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-dark/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${maxWidth} card p-6 animate-[fadeIn_0.15s_ease-out]`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-ink2 hover:text-ink transition-colors p-1 -m-1 rounded"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
