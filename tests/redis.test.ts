import { describe, it, expect, beforeEach } from 'vitest'
import { redis } from '@/lib/redis'

describe('Redis Client Adapter', () => {
  beforeEach(async () => {
    await redis.del('test:key', 'test:counter', 'url:test-slug', 'rate_limit:127.0.0.1')
  })

  it('should support ping', async () => {
    const res = await redis.ping()
    expect(res).toBeTruthy()
  })

  it('should set and get values with TTL', async () => {
    await redis.set('test:key', 'hello-world', 'EX', 60)
    const val = await redis.get('test:key')
    expect(val).toBe('hello-world')
  })

  it('should support increment and expiration', async () => {
    const count1 = await redis.incr('test:counter')
    expect(count1).toBe(1)

    await redis.expire('test:counter', 30)
    const ttl = await redis.ttl('test:counter')
    expect(ttl).toBeGreaterThan(0)

    const count2 = await redis.incr('test:counter')
    expect(count2).toBe(2)
  })

  it('should support deleting keys (cache invalidation)', async () => {
    await redis.set('url:test-slug', 'https://example.com')
    let cached = await redis.get('url:test-slug')
    expect(cached).toBe('https://example.com')

    await redis.del('url:test-slug')
    cached = await redis.get('url:test-slug')
    expect(cached).toBeNull()
  })
})
