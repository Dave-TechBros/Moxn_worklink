import { NextResponse } from "next/server"
import { verifySession } from "@/lib/session"

export async function POST() {
  const session = await verifySession()
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { execSync } = await import("child_process")
  try {
    execSync("npx tsx prisma/seed.ts", {
      cwd: process.cwd(),
      stdio: "pipe",
      env: { ...process.env, NODE_ENV: "development" },
    })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
