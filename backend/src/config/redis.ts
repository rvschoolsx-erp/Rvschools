import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../shared/utils/logger';

let redisInstance: Redis | null = null;
let redisAvailable = false;

try {
  redisInstance = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    retryStrategy: (times) => (times > 2 ? null : Math.min(times * 200, 2000)),
    lazyConnect: true,
    connectTimeout: 3000,
  });

  redisInstance.on('connect', () => {
    redisAvailable = true;
    logger.info('✅ Redis connected');
  });
  redisInstance.on('error', (err) => {
    if (redisAvailable) logger.warn('Redis unavailable — running without cache', { error: err.message });
    redisAvailable = false;
  });

  // Try to connect; silently skip if Redis isn't running
  redisInstance.connect().catch(() => {
    logger.warn('⚠️  Redis not available — caching disabled (app still works)');
  });
} catch {
  logger.warn('⚠️  Redis init failed — caching disabled');
}

export const redis = redisInstance!;

const PREFIXES = {
  session:   'session:',
  user:      'user:',
  student:   'student:',
  otp:       'otp:',
  cache:     'cache:',
  rateLimit: 'rl:',
} as const;

// Cache wrapper — silently falls back to null/no-op when Redis is down
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisAvailable || !redisInstance) return null;
    try {
      const val = await redisInstance.get(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redisAvailable || !redisInstance) return;
    try { await redisInstance.setex(key, ttlSeconds, JSON.stringify(value)); } catch {}
  },

  async del(key: string): Promise<void> {
    if (!redisAvailable || !redisInstance) return;
    try { await redisInstance.del(key); } catch {}
  },

  async delPattern(pattern: string): Promise<void> {
    if (!redisAvailable || !redisInstance) return;
    try {
      const keys = await redisInstance.keys(pattern);
      if (keys.length > 0) await redisInstance.del(...keys);
    } catch {}
  },

  prefix: PREFIXES,
};
