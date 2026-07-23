import Link from "next/link"
import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { reportFlag } from "@/lib/actions"
import { formatSalary, formatDate, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function JobDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  })

  if (!job) notFound()

  const tags: string[] = JSON.parse(job.tags || "[]")
  const isClosed = job.status === "closed"

  const session = await getSession()
  let hasApplied = false
  if (session?.role === "candidate") {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.userId },
    })
    if (profile) {
      const application = await prisma.application.findFirst({
        where: { jobId: id, candidateId: profile.id },
      })
      hasApplied = !!application
    }
  }

  async function reportThisJob(formData: FormData) {
    "use server"
    const reason = formData.get("reason") as string
    await reportFlag("job", id, reason)
    revalidatePath(`/jobs/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        href="/jobs"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to jobs
      </Link>

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">
              {job.company.name}
            </p>
          </div>
          {job.employmentType && (
            <Badge variant="secondary" className="capitalize shrink-0">
              {job.employmentType.replace("-", " ")}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">{job.location}</span>
          )}
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
          <span>Posted {formatDate(job.createdAt)}</span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <div className="prose prose-sm max-w-none text-foreground">
        <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, "<br/>") }} />
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>About {job.company.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {job.company.description && <p>{job.company.description}</p>}
          {job.company.website && (
            <p>
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {job.company.website}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 space-y-3">
        {isClosed ? (
          <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground text-center">
            This position is no longer accepting applications
          </div>
        ) : hasApplied ? (
          <div className="rounded-lg bg-muted px-4 py-3 text-sm text-center">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Applied
            </Badge>
            <span className="ml-2 text-muted-foreground">
              You have already applied to this position
            </span>
          </div>
        ) : session?.role === "candidate" ? (
          <Link
            href={`/jobs/${id}/apply`}
            className={cn(buttonVariants({ size: "lg" }), "w-full text-base no-underline")}
          >
            Apply Now
          </Link>
        ) : session ? (
          <p className="text-sm text-muted-foreground text-center">
            Only candidates can apply to jobs.
          </p>
        ) : (
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }), "w-full no-underline")}
          >
            Log in to apply
          </Link>
        )}

        <form action={reportThisJob} className="text-center">
          <input type="hidden" name="reason" value="Inappropriate content" />
          <button
            type="submit"
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Report this job
          </button>
        </form>
      </div>
    </div>
  )
}
