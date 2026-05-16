import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

type AuthenticatedHandler = (
  req: NextRequest,
  context: { userId: string; params?: Record<string, string> }
) => Promise<NextResponse>

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, { params }: { params?: Record<string, string> } = {}) => {
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

      return handler(req, { userId, params })
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}