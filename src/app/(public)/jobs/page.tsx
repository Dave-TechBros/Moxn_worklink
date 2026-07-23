import Link from "next/link"
import { Suspense } from "react"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { formatSalary, timeAgo } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { JobsFilter } from "./_components/jobs-filter"

const PAGE_SIZE = 10

function buildPageUrl(
  params: Record<string, string | undefined>,
  pageNum: number
): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value)
  }
  sp.set("page", String(pageNum))
  return `/jobs?${sp.toString()}`
}

function getDateFilter(value: string): Date | null {
  const map: Record<string, number> = {
    "24h": 1,
    week: 7,
    month: 30,
    "3months": 90,
  }
  const days = map[value]
  if (!days) return null
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

export default async function JobsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await props.searchParams
  const q = sp.q?.trim()
  const location = sp.location?.trim()
  const employmentType = sp.employmentType
  const salaryMin = sp.salaryMin ? parseInt(sp.salaryMin) : undefined
  const salaryMax = sp.salaryMax ? parseInt(sp.salaryMax) : undefined
  const datePosted = sp.datePosted
  const page = Math.max(1, parseInt(sp.page || "1"))

  const where: Prisma.JobWhereInput = { status: "published" }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ]
  }
  if (location) where.location = { contains: location }
  if (employmentType) where.employmentType = employmentType
  if (salaryMin) where.salaryMin = { gte: salaryMin }
  if (salaryMax) where.salaryMax = { lte: salaryMax }
  const dateFilter = datePosted ? getDateFilter(datePosted) : null
  if (dateFilter) where.createdAt = { gte: dateFilter }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} {total === 1 ? "job" : "jobs"} found
        </p>
      </div>

      <Suspense fallback={<div className="h-32 bg-muted rounded animate-pulse" />}>
        <JobsFilter />
      </Suspense>

      <div className="mt-8 space-y-4">
        {jobs.length === 0 ? (
          <EmptyState
            icon="\uD83D\uDD0D"
            title="No jobs found"
            description="Try adjusting your filters or search terms."
            action={{ label: "Clear filters", href: "/jobs" }}
          />
        ) : (
          jobs.map((job) => {
            const tags: string[] = JSON.parse(job.tags || "[]")
            return (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {job.company.name}
                      </p>
                    </div>
                    {job.employmentType && (
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {job.employmentType.replace("-", " ")}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {job.location && <span>{job.location}</span>}
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {timeAgo(job.createdAt)}
                  </p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {page > 1 ? (
            <Link
              href={buildPageUrl(sp, page - 1)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline")}
            >
              Previous
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={buildPageUrl(sp, page + 1)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "no-underline")}
            >
              Next
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
