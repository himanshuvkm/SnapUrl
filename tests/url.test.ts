import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as shorten } from '@/app/api/url/shorten/route'
import { DELETE as deleteUrl } from '@/app/api/url/[slug]/delete/route'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { signToken } from '@/lib/auth'
import { NextRequest } from 'next/server'

const TEST_USER_ID = 'user-123'
const TEST_TOKEN = signToken(TEST_USER_ID)

function makeRequest(body: object, token = TEST_TOKEN) {
  return new NextRequest('http://localhost:3000/api/url/shorten', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

function makeDeleteRequest(slug: string, token = TEST_TOKEN) {
  return new NextRequest(`http://localhost:3000/api/url/${slug}/delete`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

describe('POST /api/url/shorten', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should shorten a valid URL', async () => {
    vi.mocked(prisma.link.create).mockResolvedValue({
      id: 'link-123',
      slug: 'abc1234',
      longUrl: 'https://github.com/himanshuvkm',
      userId: TEST_USER_ID,
      createdAt: new Date(),
    })

    const res = await shorten(makeRequest({
      longUrl: 'https://github.com/himanshuvkm',
    }))

    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.slug).toBeDefined()
    expect(body.shortUrl).toContain('localhost:3000')
  })

  it('should return 400 for missing longUrl', async () => {
    const res = await shorten(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('should return 400 for invalid URL format', async () => {
    const res = await shorten(makeRequest({ longUrl: 'not-a-url' }))
    expect(res.status).toBe(400)
  })

  it('should return 401 without token', async () => {
    const req = new NextRequest('http://localhost:3000/api/url/shorten', {
      method: 'POST',
      body: JSON.stringify({ longUrl: 'https://github.com' }),
      headers: { 'Content-Type': 'application/json' },
      // no Authorization header
    })

    const res = await shorten(req)
    expect(res.status).toBe(401)
  })

  it('should return 409 for duplicate custom slug', async () => {
    vi.mocked(prisma.link.findUnique).mockResolvedValue({
      id: 'link-existing',
      slug: 'myslug',
      longUrl: 'https://example.com',
      userId: TEST_USER_ID,
      createdAt: new Date(),
    })

    const res = await shorten(makeRequest({
      longUrl: 'https://github.com',
      customSlug: 'myslug',
    }))

    expect(res.status).toBe(409)
  })

  it('should cache the URL in Redis after creation', async () => {
  vi.mocked(prisma.link.create).mockResolvedValue({
    id: 'link-123',
    slug: 'cached1',          // ← slug is cached1
    longUrl: 'https://github.com',
    userId: TEST_USER_ID,
    createdAt: new Date(),
  })

  // Mock findUnique to return null so customSlug check passes
  vi.mocked(prisma.link.findUnique).mockResolvedValue(null)

  await shorten(makeRequest({
    longUrl: 'https://github.com',
    customSlug: 'cached1',    // ← force the slug so we know exactly what key Redis uses
  }))

  const cached = await redis.get('url:cached1')
  expect(cached).toBe('https://github.com')
})
})

describe('DELETE /api/url/[slug]/delete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should delete a link and clear cache', async () => {
    await redis.set('url:myslug', 'https://github.com')

    vi.mocked(prisma.link.findUnique).mockResolvedValue({
      id: 'link-123',
      slug: 'myslug',
      longUrl: 'https://github.com',
      userId: TEST_USER_ID,
      createdAt: new Date(),
    })
    vi.mocked(prisma.link.delete).mockResolvedValue({
      id: 'link-123',
      slug: 'myslug',
      longUrl: 'https://github.com',
      userId: TEST_USER_ID,
      createdAt: new Date(),
    })

    const res = await deleteUrl(makeDeleteRequest('myslug'), {
      params: { slug: 'myslug' },
    })

    expect(res.status).toBe(200)

    // Confirm Redis cache was cleared
    const cached = await redis.get('url:myslug')
    expect(cached).toBeNull()
  })

  it('should return 403 if user does not own the link', async () => {
    vi.mocked(prisma.link.findUnique).mockResolvedValue({
      id: 'link-123',
      slug: 'myslug',
      longUrl: 'https://github.com',
      userId: 'different-user-id',  // ← different owner
      createdAt: new Date(),
    })

    const res = await deleteUrl(makeDeleteRequest('myslug'), {
      params: { slug: 'myslug' },
    })

    expect(res.status).toBe(403)
  })

  it('should return 404 for non-existent slug', async () => {
    vi.mocked(prisma.link.findUnique).mockResolvedValue(null)

    const res = await deleteUrl(makeDeleteRequest('ghost'), {
      params: { slug: 'ghost' },
    })

    expect(res.status).toBe(404)
  })
})

