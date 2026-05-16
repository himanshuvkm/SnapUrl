import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null // stop retrying after 3 attempts
      return Math.min(times * 200, 1000) // wait 200ms, 400ms, 600ms
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}