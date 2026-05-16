import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/middlewares/withAuth'

export const GET = withAuth(async (_req: NextRequest, { userId }) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId },
      include: { _count: { select: { clicks: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ links })
  } catch (err) {
    console.error('[GET_LINKS]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})