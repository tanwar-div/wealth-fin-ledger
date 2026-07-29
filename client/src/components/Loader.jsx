export default function Loader({ fullScreen = false, label = 'Loading' }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
      <p className="text-sm text-ink2 font-body">{label}…</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-paper">{spinner}</div>;
  }
  return <div className="py-16 flex items-center justify-center">{spinner}</div>;
}
