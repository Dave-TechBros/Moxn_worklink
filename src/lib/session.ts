import "server-only"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { cache } from "react"
import { redirect } from "next/navigation"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")

export type SessionPayload = {
  userId: string
  email: string
  role: "candidate" | "employer" | "admin"
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) redirect("/login")

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    redirect("/login")
  }
})

export const getSession = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
})

export async function requireRole(...roles: string[]) {
  const session = await verifySession()
  if (!roles.includes(session.role)) {
    throw new Error("Forbidden")
  }
  return session
}
