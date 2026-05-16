import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { withAuth } from '@/middlewares/withAuth'

export const DELETE = withAuth(
  async (_req: NextRequest, { userId, params }) => {
    try {
      const slug = params?.slug

      if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
      }

      const link = await prisma.link.findUnique({ where: { slug } })

      if (!link) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 })
      }

      if (link.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      await prisma.link.delete({ where: { slug } })

      // Always invalidate cache when deleting
      await redis.del(`url:${slug}`)
      await redis.del(`clicks:${slug}`)

      return NextResponse.json({ message: 'Link deleted' })
    } catch (err) {
      console.error('[DELETE_LINK]', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
)