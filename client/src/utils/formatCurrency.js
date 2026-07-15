export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}
