import { notFound } from "next/navigation"
import Link from "next/link"
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
import { formatDate } from "@/lib/utils"
import type { ApplicationStatus } from "@/lib/utils"
import { NotesSection } from "./notes-section"

type StatusHistoryEntry = {
  from: string | null
  to: string
  timestamp: string
  note: string
}

async function getApplication(applicationId: string, jobId: string) {
  const session = await verifySession()
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: { company: { select: { ownerUserId: true } } },
      },
      candidate: true,
    },
  })
  if (
    !application ||
    application.jobId !== jobId ||
    application.job.company.ownerUserId !== session.userId
  ) {
    return null
  }
  return application
}

function StatusHistory({ history }: { history: StatusHistoryEntry[] }) {
  return (
    <div className="space-y-3">
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No history available.</p>
      ) : (
        history.map((entry, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium">
                {i + 1}
              </div>
              {i < history.length - 1 && (
                <div className="mt-1 h-full w-px bg-border" />
              )}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-2 text-sm">
                {entry.from ? (
                  <>
                    <StatusBadge status={entry.from as ApplicationStatus} />
                    <span className="text-muted-foreground">&rarr;</span>
                  </>
                ) : null}
                <StatusBadge status={entry.to as ApplicationStatus} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(entry.timestamp)}
              </p>
              {entry.note && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicantId: string }>
}) {
  const { id: jobId, applicantId } = await params
  const application = await getApplication(applicantId, jobId)
  if (!application) notFound()

  const candidate = application.candidate
  const skills: string[] = JSON.parse(candidate.skills || "[]")
  const statusHistory: StatusHistoryEntry[] = JSON.parse(
    application.statusHistory || "[]"
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-sm text-muted-foreground">
            Applied to{" "}
            <Link
              href={`/dashboard/employer/jobs/${jobId}`}
              className="font-medium hover:underline"
            >
              {application.job.title}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status as ApplicationStatus} />
          <Button
            variant="outline"
            render={
              <Link
                href={`/dashboard/employer/jobs/${jobId}/pipeline`}
              />
            }
          >
            Pipeline
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {candidate.headline && (
            <Card>
              <CardHeader>
                <CardTitle>Headline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{candidate.headline}</p>
              </CardContent>
            </Card>
          )}

          {application.coverNote && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {application.coverNote}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusHistory history={statusHistory} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.location && (
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm">{candidate.location}</p>
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Skills</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {candidate.resumeFileId && (
                <div>
                  <p className="text-xs text-muted-foreground">Resume</p>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <a
                        href={`/api/resumes/${candidate.resumeFileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    Download Resume
                  </Button>
                </div>
              )}
              <Separator />
              <div className="space-y-1.5">
                {candidate.portfolioUrl && (
                  <a
                    href={candidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    Portfolio
                  </a>
                )}
                {candidate.linkedinUrl && (
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSection
                applicationId={application.id}
                initialNotes={application.internalNotes ?? ""}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
