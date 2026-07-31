import { DALE_QUOTES } from './constants';

/**
 * Three buckets, matching how the day actually feels rather than the clock:
 *   morning  05:00 - 11:59
 *   day      12:00 - 17:59
 *   night    18:00 - 04:59
 */
export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  return 'night';
}

/**
 * The quote pool Dale should draw from right now.
 *
 * Called at the moment he speaks (not at render) so the app can sit open across
 * midnight and still greet you correctly — no timers, no stale state.
 */
export function getDaleQuotes(mood, date = new Date()) {
  if (mood === 'sleeping') return DALE_QUOTES.sleeping;
  return DALE_QUOTES[getTimeOfDay(date)] || DALE_QUOTES.day;
}

export function pickDaleQuote(mood, date = new Date()) {
  const pool = getDaleQuotes(mood, date);
  return pool[Math.floor(Math.random() * pool.length)];
}
