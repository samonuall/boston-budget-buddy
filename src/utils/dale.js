import { DALE_QUOTES } from './constants';

/**
 * A random nice thing, picked fresh on every click.
 *
 * Dale has no moods and no sense of time — every quote in the pool is kind and
 * works at any hour, so there is nothing to branch on.
 */
export function pickDaleQuote() {
  return DALE_QUOTES[Math.floor(Math.random() * DALE_QUOTES.length)];
}
