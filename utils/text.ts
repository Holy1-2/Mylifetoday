export const stripHtml = (value: unknown): string =>
  String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

export const readingMinutes = (...parts: unknown[]): number => {
  const words = parts.map(stripHtml).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export const readingTimeLabel = (minutes: number, t: (key: string) => string): string =>
  t(minutes === 1 ? 'minReadOne' : 'minRead').replace('{minutes}', String(minutes));

export const truncate = (value: unknown, max = 180): string => {
  const text = stripHtml(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
};

export const initials = (name?: string | null): string => {
  const clean = String(name || '').trim();
  if (!clean) return 'W';
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

export const formatShortDate = (value: unknown): string => {
  if (!value) return '';
  try {
    let date: Date | null = null;
    if (value instanceof Date) date = value;
    else if (typeof value === 'object' && value && 'seconds' in value) {
      date = new Date((value as { seconds: number }).seconds * 1000);
    } else date = new Date(String(value));
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};
