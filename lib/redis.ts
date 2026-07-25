import Redis from 'ioredis'
import { Redis as UpstashRedis } from '@upstash/redis'

export interface RedisClientAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: (string | number)[]): Promise<string | null | 'OK'>
  del(...keys: string[]): Promise<number>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  ttl(key: string): Promise<number>
  ping(): Promise<string>
}

const globalForRedis = globalThis as unknown as { redisAdapter: RedisClientAdapter }

function createRedisAdapter(): RedisClientAdapter {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (restUrl && restToken) {
    const upstash = new UpstashRedis({
      url: restUrl,
      token: restToken,
    })

    return {
      async get(key: string): Promise<string | null> {
        const val = await upstash.get<string | null | object>(key)
        if (val === null || val === undefined) return null
        return typeof val === 'object' ? JSON.stringify(val) : String(val)
      },
      async set(key: string, value: string, ...args: (string | number)[]): Promise<string | null | 'OK'> {
        let exSeconds: number | undefined
        if (args[0] === 'EX' && typeof args[1] === 'number') {
          exSeconds = args[1]
        } else if (typeof args[0] === 'number') {
          exSeconds = args[0]
        }

        if (exSeconds !== undefined) {
          const res = await upstash.set(key, value, { ex: exSeconds })
          return res as 'OK'
        }
        const res = await upstash.set(key, value)
        return res as 'OK'
      },
      async del(...keys: string[]): Promise<number> {
        if (keys.length === 0) return 0
        return await upstash.del(...keys)
      },
      async incr(key: string): Promise<number> {
        return await upstash.incr(key)
      },
      async expire(key: string, seconds: number): Promise<number> {
        return await upstash.expire(key, seconds)
      },
      async ttl(key: string): Promise<number> {
        return await upstash.ttl(key)
      },
      async ping(): Promise<string> {
        return await upstash.ping()
      },
    }
  }

  // Fallback to ioredis (Local Docker / Vitest testing)
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) return null
      return Math.min(times * 200, 1000)
    },
  })

  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[Redis]', err.message)
    }
  })

  return client as unknown as RedisClientAdapter
}

export const redis = globalForRedis.redisAdapter ?? createRedisAdapter()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisAdapter = redis
}