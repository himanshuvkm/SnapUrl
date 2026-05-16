import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { headers } from 'next/headers'

interface Props {
  params: Promise<{ slug: string }>  // ← Promise now
}

export default async function RedirectPage({ params }: Props) {
  const { slug } = await params  // ← await it

  const start = Date.now()

  // 1. Check Redis cache first
  const cached = await redis.get(`url:${slug}`)

  if (cached) {
    console.log(`Cache HIT for ${slug} — ${Date.now() - start}ms`)
    await trackClick(slug)
    redirect(cached)
  }

  // 2. Cache miss — query DB
  const link = await prisma.link.findUnique({ where: { slug } })

  if (!link) return notFound()

  console.log(`Cache MISS for ${slug} — ${Date.now() - start}ms`)

  // 3. Write to cache for next time
  await redis.set(`url:${slug}`, link.longUrl, 'EX', 60 * 60 * 24)

  await trackClick(slug)
  redirect(link.longUrl)
}

async function trackClick(slug: string) {
  try {
    const headersList = await headers()  // ← await headers() too
    const userAgent = headersList.get('user-agent') || ''
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headersList.get('x-real-ip') ||
      'unknown'

    const link = await prisma.link.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!link) return

    await prisma.click.create({
      data: { linkId: link.id, userAgent, ip },
    })

    await redis.incr(`clicks:${slug}`)
  } catch (err) {
    console.error('[TRACK_CLICK]', err)
  }
}