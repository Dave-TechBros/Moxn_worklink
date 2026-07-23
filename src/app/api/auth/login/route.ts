import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=Email+and+password+are+required", request.url))
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=Invalid+email+or+password", request.url))
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=Invalid+email+or+password", request.url))
  }

  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  const redirectMap: Record<string, string> = {
    admin: "/dashboard/admin/companies",
    employer: "/dashboard/employer/jobs",
    candidate: "/jobs",
  }

  const response = NextResponse.redirect(new URL(redirectMap[user.role] || "/", request.url))
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
