import { vi } from 'vitest'

// Load env vars before any test runs
process.env.JWT_SECRET = 'test-secret-for-vitest'
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'

vi.mock('@/lib/redis', () => {
  const RedisMock = require('ioredis-mock')
  return { redis: new RedisMock() }
})

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    link: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    click: {
      create: vi.fn(),
    },
  },
}))