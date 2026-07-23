import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const file = await prisma.file.findUnique({ where: { id } })
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  return new NextResponse(file.data, {
    headers: {
      "Content-Type": file.mimetype,
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Content-Length": String(file.size),
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const formData = await request.formData()
  const fileField = formData.get("file")

  if (!fileField || !(fileField instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const buffer = Buffer.from(await fileField.arrayBuffer())

  const file = await prisma.file.create({
    data: {
      id,
      filename: fileField.name,
      mimetype: fileField.type,
      data: buffer,
      size: buffer.length,
    },
  })

  return NextResponse.json({ id: file.id, filename: file.filename, size: file.size })
}
