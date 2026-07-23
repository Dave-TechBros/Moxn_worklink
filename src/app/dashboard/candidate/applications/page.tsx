import Link from "next/link"
import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate, timeAgo } from "@/lib/utils"
import type { ApplicationStatus } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ApplicationsPage() {
  const session = await verifySession()

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.userId },
  })

  if (!profile) {
    return <EmptyState title="Profile not found" description="Complete your profile to start applying." action={{ label: "Go to Profile", href: "/dashboard/candidate/profile" }} />
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: profile.id },
    include: {
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  if (applications.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No applications yet"
        description="No applications yet — browse open roles"
        action={{ label: "Browse Jobs", href: "/jobs" }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of your job applications.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <Link
                  href={`/jobs/${app.jobId}`}
                  className="font-medium hover:underline"
                >
                  {app.job.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {app.job.company.name}
              </TableCell>
              <TableCell>
                <StatusBadge status={app.status as ApplicationStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(app.createdAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {timeAgo(app.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
