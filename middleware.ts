import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que requerem autenticação
const protectedRoutes = ['/professor']

// Rotas de autenticação (usuários logados não devem acessar)
const authRoutes = ['/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Por enquanto, apenas deixar passar todas as requisi\u00e7\u00f5es
  // A autentica\u00e7\u00e3o ser\u00e1 verificada no client-side
  // O Supabase usa localStorage, n\u00e3o cookies por padr\u00e3o
  
  console.log('Middleware - Pathname:', pathname)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
