import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET() {
  let dbStatus = 'disconnected'
  let redisStatus = 'disconnected'

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch (err) {
    console.error('[HEALTH] Database healthcheck failed:', err)
  }

  try {
    await redis.ping()
    redisStatus = 'connected'
  } catch (err) {
    console.error('[HEALTH] Redis healthcheck failed:', err)
  }

  const isHealthy = dbStatus === 'connected' && redisStatus === 'connected'

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 }
  )
}