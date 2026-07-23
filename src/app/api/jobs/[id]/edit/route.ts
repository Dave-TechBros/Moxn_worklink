import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (session.role !== "employer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: { select: { ownerUserId: true } } },
    })

    if (!job || job.company.ownerUserId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const tags: string[] = JSON.parse(job.tags || "[]")

    return NextResponse.json({
      title: job.title,
      description: job.description,
      location: job.location ?? "",
      employmentType: job.employmentType ?? "",
      salaryMin: job.salaryMin?.toString() ?? "",
      salaryMax: job.salaryMax?.toString() ?? "",
      tags: tags.join(", "),
      status: job.status,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
