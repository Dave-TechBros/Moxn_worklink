import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { PipelineSkeleton } from "@/components/shared/loading-skeleton"
import { PipelineBoard } from "./pipeline-board"

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: { select: { ownerUserId: true } },
    },
  })
  if (!job || job.company.ownerUserId !== session.userId) notFound()

  const applicants = await prisma.application.findMany({
    where: { jobId: id },
    include: {
      candidate: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = applicants.map((a) => ({
    id: a.id,
    status: a.status,
    coverNote: a.coverNote,
    createdAt: a.createdAt.toISOString(),
    candidate: { name: a.candidate.name },
  }))

  return (
    <Suspense fallback={<PipelineSkeleton />}>
      <PipelineBoard jobId={id} initialApplicants={serialized} />
    </Suspense>
  )
}
