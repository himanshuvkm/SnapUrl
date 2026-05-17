import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient() {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,        // ← don't connect until first command
    enableOfflineQueue: false, // ← don't queue commands if disconnected
    retryStrategy(times) {
      if (times > 3) return null
      return Math.min(times * 200, 1000)
    },
  })

  // Only log errors, don't crash
  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[Redis]', err.message)
    }
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}