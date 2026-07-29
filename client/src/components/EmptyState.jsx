export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center mb-4">
          <Icon size={22} className="text-ink2" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink2 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
