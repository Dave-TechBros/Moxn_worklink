import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import {
  formatDate,
  formatSalary,
  timeAgo,
  APPLICATION_STATUSES,
} from "@/lib/utils"
import type { ApplicationStatus } from "@/lib/utils"

const jobStatusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await verifySession()

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      applications: {
        include: {
          candidate: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!job || job.company.ownerUserId !== session.userId) {
    notFound()
  }

  const statusCounts = APPLICATION_STATUSES.reduce(
    (acc, s) => {
      acc[s] = job.applications.filter((a) => a.status === s).length
      return acc
    },
    {} as Record<string, number>
  )

  const tags: string[] = JSON.parse(job.tags || "[]")

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {job.location && <span>{job.location}</span>}
            {job.employmentType && (
              <span className="capitalize">
                {job.employmentType.replace("-", " ")}
              </span>
            )}
            {(job.salaryMin || job.salaryMax) && (
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            )}
            <span>Posted {timeAgo(job.createdAt)}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge className={jobStatusStyles[job.status] ?? ""}>
              {job.status}
            </Badge>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href={`/dashboard/employer/jobs/${job.id}/edit`} />}
          >
            Edit
          </Button>
          <Button
            render={
              <Link href={`/dashboard/employer/jobs/${job.id}/pipeline`} />
            }
          >
            Pipeline View
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {job.description}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {APPLICATION_STATUSES.map((status) => (
          <Card key={status}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{statusCounts[status]}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {status}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Applicants ({job.applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {job.applications.length === 0 ? (
            <div className="px-(--card-spacing) pb-(--card-spacing)">
              <EmptyState
                title="No applicants yet"
                description="Applications will appear here once candidates start applying."
              />
            </div>
          ) : (
            <div className="divide-y">
              {job.applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/employer/jobs/${job.id}/applicants/${app.id}`}
                  className="flex items-center justify-between px-(--card-spacing) py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {app.candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {app.candidate.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {timeAgo(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status as ApplicationStatus} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
