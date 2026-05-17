import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

type AuthenticatedHandler = (
  req: NextRequest,
  context: { userId: string; params?: Record<string, string> }
) => Promise<NextResponse>

type RouteContext = {
  params?: Promise<Record<string, string>> | Record<string, string>
}

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: RouteContext = {}) => {
    try {
      const authHeader = req.headers.get('authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        )
      }

      const token = authHeader.split(' ')[1]
      const { userId } = verifyToken(token)

      // Await params if it's a Promise (Next.js 15)
      const resolvedParams = context.params
        ? await Promise.resolve(context.params)
        : undefined

      return handler(req, { userId, params: resolvedParams })
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}