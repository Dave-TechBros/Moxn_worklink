import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const name = formData.get("name") as string

  if (!email || !password || !name || !role) {
    return NextResponse.redirect(new URL("/register?error=All+fields+are+required", request.url))
  }

  if (password.length < 8) {
    return NextResponse.redirect(new URL("/register?error=Password+must+be+at+least+8+characters", request.url))
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.redirect(new URL("/register?error=An+account+with+this+email+already+exists", request.url))
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
    },
  })

  if (role === "candidate") {
    await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        name,
        skills: "[]",
      },
    })
  } else {
    await prisma.company.create({
      data: {
        ownerUserId: user.id,
        name: `${name}'s Company`,
      },
    })
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
