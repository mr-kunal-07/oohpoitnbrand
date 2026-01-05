import { NextResponse } from "next/server"

export function proxy(req) {
    const { pathname } = req.nextUrl

    const token = req.cookies.get("token")?.value

    const publicRoutes = ["/"]

    // ✅ Authenticated user
    if (token) {
        if (publicRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
        return NextResponse.next()
    }

    // ❌ Not authenticated
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/", req.url))
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
}
