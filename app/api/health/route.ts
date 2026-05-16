import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    await redis.ping()
    return NextResponse.json({
      status: 'ok',
      redis: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      status: 'ok',
      redis: 'disconnected',
      error: String(err),
    }, { status: 500 })
  }
}