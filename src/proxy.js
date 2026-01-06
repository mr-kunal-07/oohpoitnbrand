import { NextResponse } from "next/server"

export function proxy(req) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get("token")?.value

    // ✅ Authenticated user trying to access "/"
    if (token && pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // ✅ Authenticated user accessing protected routes
    if (token) {
        return NextResponse.next()
    }

    // ❌ Not authenticated trying to access "/"
    if (pathname === "/") {
        return NextResponse.next()
    }

    // ❌ Not authenticated trying to access protected routes
    return NextResponse.redirect(new URL("/", req.url))
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
}
