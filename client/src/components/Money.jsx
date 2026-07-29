const formatMoney = (value, currency = 'USD') => {
  const n = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
};

export default function Money({ value, currency = 'USD', className = '', sign = false }) {
  const n = Number(value) || 0;
  const prefix = sign && n > 0 ? '+' : '';
  return (
    <span className={`amount ${className}`}>
      {prefix}
      {formatMoney(n, currency)}
    </span>
  );
}

export { formatMoney };
