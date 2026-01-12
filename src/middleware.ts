import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth'

export async function middleware(request: NextRequest) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('session')?.value

    // Protected routes pattern
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/leads')) {

        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const payload = await verifySession(sessionCookie)
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // We can also check roles here and redirect if unauthorized
    }

    // Redirect root to dashboard or login
    if (request.nextUrl.pathname === '/') {
        if (sessionCookie && await verifySession(sessionCookie)) {
            return NextResponse.redirect(new URL('/leads', request.url)) // Leads is main page
        } else {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
