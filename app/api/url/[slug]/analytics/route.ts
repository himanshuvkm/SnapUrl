import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { withAuth } from '@/middlewares/withAuth'

export const GET = withAuth(
  async (_req: NextRequest, { userId, params }) => {
    try {
      const slug = params?.slug

      if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
      }

      // Verify ownership
      const link = await prisma.link.findUnique({
        where: { slug },
        include: { clicks: true },
      })

      if (!link) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 })
      }

      if (link.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Total clicks from Redis counter (fast)
      const redisCount = await redis.get(`clicks:${slug}`)
      const totalClicks = redisCount ? parseInt(redisCount) : link.clicks.length

      // Device breakdown from user-agent
      const deviceBreakdown = link.clicks.reduce(
        (acc, click) => {
          const ua = click.userAgent?.toLowerCase() || ''
          if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            acc.mobile++
          } else if (ua.includes('tablet') || ua.includes('ipad')) {
            acc.tablet++
          } else {
            acc.desktop++
          }
          return acc
        },
        { desktop: 0, mobile: 0, tablet: 0 }
      )

      // Clicks over time — group by date
      const clicksByDate = link.clicks.reduce<Record<string, number>>((acc, click) => {
        const date = click.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      // Last 7 days timeline
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const key = date.toISOString().split('T')[0]
        return { date: key, clicks: clicksByDate[key] || 0 }
      }).reverse()

      return NextResponse.json({
        slug,
        longUrl: link.longUrl,
        totalClicks,
        deviceBreakdown,
        last7Days,
        createdAt: link.createdAt,
      })
    } catch (err) {
      console.error('[ANALYTICS]', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
)