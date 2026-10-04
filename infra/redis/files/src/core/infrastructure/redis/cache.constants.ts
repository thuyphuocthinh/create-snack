import { buildTTL } from '../../utils/ttl.util.js';

const GLOBAL_PREFIX = '{{PROJECT_NAME_SNAKE}}';
const GLOBAL_VER = 'v1';

/**
 * Semantic TTL constants (in seconds).
 * Pick based on data volatility — see the guidelines at the bottom of this file.
 */
export const TTL = {
  TINY: buildTTL('MINUTE', 1), // highly volatile (stock count, live price)
  SHORT: buildTTL('MINUTE', 5), // semi-volatile (entity detail)
  MEDIUM: buildTTL('HOUR', 1), // semi-static (user profile, settings)
  LONG: buildTTL('DAY', 1), // static (lookup tables, config)
  WEEK: buildTTL('DAY', 7), // almost never changes
} as const;

/**
 * Centralised cache-key factories.
 *
 * Key format:  <prefix>:<global-ver>:<domain>:<domain-ver>:<type>:<field>_<value>
 * Example:     {{PROJECT_NAME_SNAKE}}:v1:orders:v1:order:id_01J8...
 *
 * Why a domain _VER?
 *   Bumping ORDERS._VER instantly invalidates every key under that domain without
 *   touching Redis — old keys just expire naturally.
 *
 * Add a block per bounded context, e.g.:
 *
 *   ORDERS: {
 *     _VER: 'v1',
 *     KEYS: {
 *       DETAIL: (id: string): string =>
 *         `${GLOBAL_PREFIX}:${GLOBAL_VER}:orders:${CACHE.ORDERS._VER}:order:id_${id}`,
 *     },
 *   },
 */
export const CACHE = {
  RATE_LIMIT: {
    _VER: 'v1',
    KEYS: {
      // route: Express route pattern (e.g. /auth/login), identifier: e.g. ip:1.1.1.1
      BUCKET: (route: string, identifier: string) =>
        `${GLOBAL_PREFIX}:${GLOBAL_VER}:ratelimit:${CACHE.RATE_LIMIT._VER}:${route}:${identifier}`,
    },
  },
} as const;

/*
 * ── Cache TTL guidelines ─────────────────────────────────────────────────────
 *
 * 1. Data volatility
 *    · Static (config, lookup tables)         → LONG / WEEK
 *    · Semi-static (detail, profile)           → MEDIUM / SHORT
 *    · Highly volatile (price, stock)          → TINY / SHORT, avoid tags
 *
 * 2. List vs detail TTL
 *    · List keys   → shorter TTL (10–30 min) or version-tracked
 *    · Detail keys → longer TTL, invalidated on write
 *
 * 3. Avoid thundering-herd / cache stampede
 *    RedisService.set() already adds jitter to every TTL.
 *
 * 4. Stale data
 *    Always invalidate (redis.invalidateDetail) right after a successful write.
 * ─────────────────────────────────────────────────────────────────────────────
 */
