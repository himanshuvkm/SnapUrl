import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// Helper to build a NextRequest easily
function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should register a new user and return a token', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'user-123',
      email: 'test@test.com',
      password: 'hashed',
      createdAt: new Date(),
    })

    const res = await register(makeRequest({
      email: 'test@test.com',
      password: '123456',
    }))

    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.token).toBeDefined()
    expect(body.userId).toBe('user-123')
  })

  it('should return 409 if user already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      email: 'test@test.com',
      password: 'hashed',
      createdAt: new Date(),
    })

    const res = await register(makeRequest({
      email: 'test@test.com',
      password: '123456',
    }))

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('User already exists')
  })

  it('should return 400 if email is missing', async () => {
    const res = await register(makeRequest({ password: '123456' }))
    expect(res.status).toBe(400)
  })

  it('should return 400 if password is too short', async () => {
    const res = await register(makeRequest({
      email: 'test@test.com',
      password: '123',
    }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should login and return a token', async () => {
    const hashed = await bcrypt.hash('123456', 10)

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      email: 'test@test.com',
      password: hashed,
      createdAt: new Date(),
    })

    const res = await login(makeRequest({
      email: 'test@test.com',
      password: '123456',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.token).toBeDefined()
  })

  it('should return 401 for wrong password', async () => {
    const hashed = await bcrypt.hash('correctpassword', 10)

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-123',
      email: 'test@test.com',
      password: hashed,
      createdAt: new Date(),
    })

    const res = await login(makeRequest({
      email: 'test@test.com',
      password: 'wrongpassword',
    }))

    expect(res.status).toBe(401)
  })

  it('should return 401 for non-existent user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await login(makeRequest({
      email: 'nobody@test.com',
      password: '123456',
    }))

    expect(res.status).toBe(401)
  })
})