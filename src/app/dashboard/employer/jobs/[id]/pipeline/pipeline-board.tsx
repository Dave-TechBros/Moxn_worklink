"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { updateApplicationStatus } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { toast } from "sonner"
import {
  APPLICATION_STATUSES,
  canTransitionTo,
  timeAgo,
} from "@/lib/utils"
import type { ApplicationStatus } from "@/lib/utils"

type SerializedApplicant = {
  id: string
  status: string
  coverNote: string | null
  createdAt: string
  candidate: { name: string }
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
}

function ConfirmCloseDialog({
  applicantName,
  onConfirm,
}: {
  applicantName: string
  onConfirm: () => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="xs" variant="destructive" />}>
        Close
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close application</DialogTitle>
          <DialogDescription>
            Are you sure you want to close {applicantName}&apos;s application?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ApplicantCard({
  applicant,
  validTransitions,
  onTransition,
}: {
  applicant: SerializedApplicant
  validTransitions: ApplicationStatus[]
  onTransition: (id: string, status: string) => void
}) {
  const coverSnippet = applicant.coverNote
    ? applicant.coverNote.slice(0, 100) +
      (applicant.coverNote.length > 100 ? "…" : "")
    : null

  return (
    <Card size="sm">
      <CardContent className="space-y-2 p-3">
        <p className="text-sm font-medium">{applicant.candidate.name}</p>
        <p className="text-xs text-muted-foreground">
          Applied {timeAgo(applicant.createdAt)}
        </p>
        {coverSnippet && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            &ldquo;{coverSnippet}&rdquo;
          </p>
        )}
        {validTransitions.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {validTransitions.map((nextStatus) =>
              nextStatus === "closed" ? (
                <ConfirmCloseDialog
                  key={nextStatus}
                  applicantName={applicant.candidate.name}
                  onConfirm={() => onTransition(applicant.id, nextStatus)}
                />
              ) : (
                <Button
                  key={nextStatus}
                  size="xs"
                  variant="outline"
                  onClick={() => onTransition(applicant.id, nextStatus)}
                >
                  {STATUS_LABELS[nextStatus]}
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function KanbanColumn({
  status,
  applicants,
  onTransition,
}: {
  status: string
  applicants: SerializedApplicant[]
  onTransition: (id: string, status: string) => void
}) {
  const validTransitions = canTransitionTo(status as ApplicationStatus)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <StatusBadge status={status as ApplicationStatus} />
        <span className="text-sm text-muted-foreground">
          ({applicants.length})
        </span>
      </div>
      <div className="flex min-h-[200px] flex-col gap-2 rounded-lg bg-muted/30 p-2">
        {applicants.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground">
              No applicants here yet
            </p>
          </div>
        ) : (
          applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              validTransitions={validTransitions}
              onTransition={onTransition}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function PipelineBoard({
  jobId,
  initialApplicants,
}: {
  jobId: string
  initialApplicants: SerializedApplicant[]
}) {
  const router = useRouter()
  const [applicants, setApplicants] = React.useState(initialApplicants)

  async function handleTransition(applicationId: string, newStatus: string) {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicationId ? { ...a, status: newStatus } : a
      )
    )
    const result = await updateApplicationStatus(applicationId, newStatus)
    if (result.success) {
      toast.success(
        `Application moved to ${STATUS_LABELS[newStatus] ?? newStatus}`
      )
      router.refresh()
    } else {
      setApplicants(initialApplicants)
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/employer/jobs/${jobId}`)}
        >
          Back to Job
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applicants={applicants.filter((a) => a.status === status)}
            onTransition={handleTransition}
          />
        ))}
      </div>
    </div>
  )
}
