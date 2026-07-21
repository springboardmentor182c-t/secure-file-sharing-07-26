export function formatDate(date, locale = 'en-US', options) {
  if (!date) return '';
  const d = new Date(date);
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(d);
}
