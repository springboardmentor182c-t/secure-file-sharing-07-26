export function formatCurrency(value, locale = 'en-US', currency = 'USD') {
  if (value == null) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}
