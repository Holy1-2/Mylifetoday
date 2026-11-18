import type { DailyVerse } from '../types';

const DAY_MS = 86_400_000;

export const todayKey = (date = new Date()): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const createdAtMs = (verse: DailyVerse): number => {
  const raw = verse.createdAt;
  if (!raw) return 0;
  if (typeof raw === 'number') return raw < 1e12 ? raw * 1000 : raw;
  if (typeof raw === 'object' && typeof raw.seconds === 'number') {
    return raw.seconds * 1000;
  }
  if (typeof raw.toDate === 'function') {
    const parsed = raw.toDate();
    return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed.getTime() : 0;
  }
  const parsed = new Date(String(raw)).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

/** A verse is live only on its scheduled date (or for 24h if it has no date). */
export const isVerseLive = (verse: DailyVerse, now = new Date()): boolean => {
  if (verse.status && verse.status !== 'published') return false;
  if (verse.date) return verse.date === todayKey(now);
  const created = createdAtMs(verse);
  return created > 0 && now.getTime() - created < DAY_MS;
};

export const isVersePast = (verse: DailyVerse, now = new Date()): boolean => {
  if (verse.status && verse.status !== 'published') return false;
  if (verse.date) return verse.date < todayKey(now);
  const created = createdAtMs(verse);
  return created > 0 && now.getTime() - created >= DAY_MS;
};

export const pickLiveVerse = (verses: DailyVerse[], now = new Date()): DailyVerse | null =>
  verses.find((verse) => isVerseLive(verse, now)) || null;

export const pickPastVerses = (verses: DailyVerse[], now = new Date()): DailyVerse[] =>
  verses.filter((verse) => isVersePast(verse, now));
