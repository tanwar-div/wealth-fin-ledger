import Money from './Money';

export default function StatCard({ label, value, isMoney = true, tone = 'default', hint, icon: Icon }) {
  const toneClass = tone === 'growth' ? 'text-growth' : tone === 'rust' ? 'text-rust' : 'text-ink';

  return (
    <div className="card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {Icon && <Icon size={16} className="text-ink2" strokeWidth={1.75} />}
      </div>
      <div className={`font-display text-2xl md:text-3xl ${toneClass}`}>
        {isMoney ? <Money value={value} /> : value}
      </div>
      {hint && <p className="text-xs text-ink2">{hint}</p>}
    </div>
  );
}
