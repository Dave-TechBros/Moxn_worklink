import Link from "next/link"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { closeJob } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ListSkeleton } from "@/components/shared/loading-skeleton"
import { timeAgo } from "@/lib/utils"

const jobStatusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

async function JobsTable() {
  const session = await verifySession()
  const company = await prisma.company.findUnique({
    where: { ownerUserId: session.userId },
  })
  if (!company) {
    return (
      <EmptyState
        title="No company found"
        description="Set up your company profile to start posting jobs."
        action={{ label: "Company Settings", href: "/dashboard/employer/settings" }}
      />
    )
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  })

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs posted yet"
        description="Post your first job to start receiving applications from qualified candidates."
        action={{ label: "Post a Job", href: "/dashboard/employer/jobs/new" }}
      />
    )
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applicants</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/dashboard/employer/jobs/${job.id}`}
                  className="hover:underline"
                >
                  {job.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge className={jobStatusStyles[job.status] ?? ""}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>{job._count.applications}</TableCell>
              <TableCell className="text-muted-foreground">
                {timeAgo(job.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/dashboard/employer/jobs/${job.id}/edit`} />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/dashboard/employer/jobs/${job.id}`} />}
                  >
                    View
                  </Button>
                  {job.status !== "closed" && (
                    <form action={async () => { await closeJob(job.id) }}>
                      <Button type="submit" size="sm" variant="destructive">
                        Close
                      </Button>
                    </form>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <Button render={<Link href="/dashboard/employer/jobs/new" />}>
          Post New Job
        </Button>
      </div>
      <Suspense fallback={<ListSkeleton count={3} />}>
        <JobsTable />
      </Suspense>
    </div>
  )
}
