import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

const authPaths = ["/login", "/register"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("session")?.value

  let session: { role?: string } | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret)
      session = payload as { role?: string }
    } catch {}
  }

  const role = session?.role ?? "candidate"
  const isAuthenticated = !!session
  const isOnAuthPage = authPaths.some((p) => pathname.startsWith(p))
  const isOnDashboard = pathname.startsWith("/dashboard")

  if (isAuthenticated && isOnAuthPage) {
    const redirectMap: Record<string, string> = {
      admin: "/dashboard/admin/companies",
      employer: "/dashboard/employer/jobs",
      candidate: "/jobs",
    }
    return NextResponse.redirect(new URL(redirectMap[role] || "/", request.url))
  }

  if (!isAuthenticated && isOnDashboard) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthenticated && isOnDashboard) {
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (pathname.startsWith("/dashboard/employer") && role !== "employer") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (pathname.startsWith("/dashboard/candidate") && role !== "candidate") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
