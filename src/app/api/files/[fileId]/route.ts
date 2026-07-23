import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId } = await params
    const file = await prisma.file.findUnique({ where: { id: fileId } })
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return new NextResponse(file.data, {
      headers: {
        "Content-Type": file.mimetype,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": file.size.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
