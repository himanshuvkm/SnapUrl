import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const WINDOW_SECONDS = 60
const MAX_REQUESTS = 100

export async function rateLimiter(req: NextRequest): Promise<NextResponse | null> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'

  const key = `rate_limit:${ip}`

  const current = await redis.incr(key)

  if (current === 1) {
    // First request in this window — set expiry
    await redis.expire(key, WINDOW_SECONDS)
  }

  if (current > MAX_REQUESTS) {
    const ttl = await redis.ttl(key)
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: ttl },
      {
        status: 429,
        headers: { 'Retry-After': String(ttl) },
      }
    )
  }

  return null // null means "allowed, continue"
}