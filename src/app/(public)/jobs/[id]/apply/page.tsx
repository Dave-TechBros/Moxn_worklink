import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { ApplyForm } from "./apply-form"

export default async function ApplyPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const session = await verifySession()
  if (session.role !== "candidate") redirect("/login")

  const [profile, job] = await Promise.all([
    prisma.candidateProfile.findUnique({ where: { userId: session.userId } }),
    prisma.job.findUnique({ where: { id } }),
  ])

  if (!profile) redirect("/dashboard/candidate/profile")
  if (!job || job.status !== "published") redirect("/jobs")

  const existingApplication = await prisma.application.findFirst({
    where: { jobId: id, candidateId: profile.id },
  })
  if (existingApplication) redirect("/dashboard/candidate/applications")

  const skills: string[] = JSON.parse(profile.skills || "[]")

  return (
    <ApplyForm
      jobId={id}
      jobTitle={job.title}
      companyName={(await prisma.company.findUnique({ where: { id: job.companyId } }))?.name || ""}
      profile={{
        name: profile.name,
        headline: profile.headline || "",
        location: profile.location || "",
        skills,
        resumeFileId: profile.resumeFileId || "",
      }}
    />
  )
}
