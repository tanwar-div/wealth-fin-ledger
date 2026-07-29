export default function ProgressBar({ percent, tone = 'growth' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const toneClass = tone === 'growth' ? 'bg-growth' : tone === 'gold' ? 'bg-gold' : 'bg-ink';

  return (
    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
      <div
        className={`h-full ${toneClass} rounded-full transition-all duration-500`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
