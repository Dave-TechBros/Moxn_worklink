"use server"

import { prisma } from "@/lib/prisma"
import { verifySession, getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

// Job actions
export async function createJob(formData: FormData) {
  const session = await verifySession()
  if (session.role !== "employer") throw new Error("Forbidden")

  const company = await prisma.company.findUnique({ where: { ownerUserId: session.userId } })
  if (!company) throw new Error("No company found")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const employmentType = formData.get("employmentType") as string
  const salaryMin = formData.get("salaryMin") ? parseInt(formData.get("salaryMin") as string) : null
  const salaryMax = formData.get("salaryMax") ? parseInt(formData.get("salaryMax") as string) : null
  const tags = formData.get("tags") as string
  const status = formData.get("status") as string || "draft"

  if (!title || !description) return { error: "Title and description are required" }

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      description,
      location,
      employmentType,
      salaryMin,
      salaryMax,
      tags: JSON.stringify(tags ? tags.split(",").map((t: string) => t.trim()) : []),
      status,
    },
  })

  revalidatePath("/dashboard/employer/jobs")
  return { success: true, jobId: job.id }
}

export async function updateJob(jobId: string, formData: FormData) {
  const session = await verifySession()
  if (session.role !== "employer") throw new Error("Forbidden")

  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } })
  if (!job || job.company.ownerUserId !== session.userId) throw new Error("Forbidden")

  const data: Record<string, string | number | null> = {}
  const fields = ["title", "description", "location", "employmentType", "status"]
  for (const field of fields) {
    const val = formData.get(field)
    if (val) data[field] = val as string
  }
  const salaryMin = formData.get("salaryMin")
  const salaryMax = formData.get("salaryMax")
  if (salaryMin) data.salaryMin = parseInt(salaryMin as string)
  if (salaryMax) data.salaryMax = parseInt(salaryMax as string)
  const tags = formData.get("tags")
  if (tags) data.tags = JSON.stringify((tags as string).split(",").map((t: string) => t.trim()))

  await prisma.job.update({ where: { id: jobId }, data })

  revalidatePath(`/dashboard/employer/jobs/${jobId}`)
  revalidatePath("/dashboard/employer/jobs")
  return { success: true }
}

export async function closeJob(jobId: string) {
  const session = await verifySession()
  if (session.role !== "employer") throw new Error("Forbidden")

  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } })
  if (!job || job.company.ownerUserId !== session.userId) throw new Error("Forbidden")

  await prisma.job.update({ where: { id: jobId }, data: { status: "closed" } })
  revalidatePath("/dashboard/employer/jobs")
  return { success: true }
}

// Application actions
export async function applyToJob(jobId: string, formData: FormData) {
  const session = await verifySession()
  if (session.role !== "candidate") throw new Error("Only candidates can apply")

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.userId } })
  if (!profile) throw new Error("Complete your profile first")

  const existing = await prisma.application.findFirst({
    where: { jobId, candidateId: profile.id },
  })
  if (existing) return { error: "You have already applied to this job" }

  const coverNote = formData.get("coverNote") as string
  const resumeFileId = formData.get("resumeFileId") as string

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: profile.id,
      coverNote,
      resumeFileId: resumeFileId || profile.resumeFileId,
      statusHistory: JSON.stringify([{ from: null, to: "new", timestamp: new Date().toISOString(), note: "Application submitted" }]),
    },
  })

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath("/dashboard/candidate/applications")
  return { success: true, applicationId: application.id }
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string
) {
  const session = await verifySession()
  if (session.role !== "employer") throw new Error("Forbidden")

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { include: { company: true } } },
  })
  if (!application || application.job.company.ownerUserId !== session.userId) throw new Error("Forbidden")

  const prevHistory = JSON.parse(application.statusHistory)
  const updatedHistory = [
    ...prevHistory,
    {
      from: application.status,
      to: newStatus,
      timestamp: new Date().toISOString(),
      note: `Status changed to ${newStatus}`,
    },
  ]

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      statusHistory: JSON.stringify(updatedHistory),
    },
  })

  revalidatePath(`/dashboard/employer/jobs/${application.jobId}`)
  return { success: true }
}

export async function saveInternalNote(applicationId: string, note: string) {
  const session = await verifySession()
  if (session.role !== "employer") throw new Error("Forbidden")

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { include: { company: true } } },
  })
  if (!application || application.job.company.ownerUserId !== session.userId) throw new Error("Forbidden")

  await prisma.application.update({
    where: { id: applicationId },
    data: { internalNotes: note },
  })

  return { success: true }
}

// Profile actions
export async function updateProfile(formData: FormData) {
  const session = await verifySession()

  const data: Record<string, string | null> = {}
  const fields = ["name", "headline", "location", "portfolioUrl", "linkedinUrl"]
  for (const field of fields) {
    const val = formData.get(field)
    if (val) data[field] = val as string
  }

  const skills = formData.get("skills")
  if (skills) {
    data.skills = JSON.stringify((skills as string).split(",").map((s: string) => s.trim()))
  }

  await prisma.candidateProfile.update({
    where: { userId: session.userId },
    data,
  })

  revalidatePath("/dashboard/candidate/profile")
  return { success: true }
}

// Company actions
export async function updateCompany(formData: FormData) {
  const session = await verifySession()
  if (session.role !== "employer") throw new Error("Forbidden")

  const data: Record<string, string | null> = {}
  const fields = ["name", "description", "website"]
  for (const field of fields) {
    const val = formData.get(field)
    if (val) data[field] = val as string
  }

  await prisma.company.update({ where: { ownerUserId: session.userId }, data })
  revalidatePath("/dashboard/employer/jobs")
  return { success: true }
}

// Admin actions
export async function suspendCompany(companyId: string) {
  const session = await verifySession()
  if (session.role !== "admin") throw new Error("Forbidden")

  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) return { error: "Company not found" }

  const newStatus = company.status === "suspended" ? "active" : "suspended"
  await prisma.company.update({ where: { id: companyId }, data: { status: newStatus } })
  revalidatePath("/dashboard/admin/companies")
  return { success: true }
}

export async function closeJobAdmin(jobId: string) {
  const session = await verifySession()
  if (session.role !== "admin") throw new Error("Forbidden")

  await prisma.job.update({ where: { id: jobId }, data: { status: "closed" } })
  revalidatePath("/dashboard/admin/flags")
  return { success: true }
}

export async function resolveFlag(flagId: string) {
  const session = await verifySession()
  if (session.role !== "admin") throw new Error("Forbidden")

  await prisma.flag.update({ where: { id: flagId }, data: { status: "resolved" } })
  revalidatePath("/dashboard/admin/flags")
  return { success: true }
}

export async function reportFlag(targetType: string, targetId: string, reason: string) {
  const session = await getSession()
  if (!session) return { error: "Please log in to report" }

  await prisma.flag.create({
    data: {
      targetType,
      targetId,
      reason,
      reportedById: session.userId,
    },
  })

  return { success: true }
}
