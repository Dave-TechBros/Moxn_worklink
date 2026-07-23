"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { updateJob } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { EMPLOYMENT_TYPES } from "@/lib/utils"

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [defaults, setDefaults] = React.useState<{
    title: string
    description: string
    location: string
    employmentType: string
    salaryMin: string
    salaryMax: string
    tags: string
    status: string
  } | null>(null)

  React.useEffect(() => {
    fetchJob()
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}/edit`)
        if (!res.ok) throw new Error("Not found")
        const data = await res.json()
        setDefaults(data)
      } catch {
        toast.error("Failed to load job")
        router.push("/dashboard/employer/jobs")
      } finally {
        setLoading(false)
      }
    }
  }, [id, router])

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      try {
        await updateJob(id, formData)
        toast.success("Job updated successfully")
        router.push(`/dashboard/employer/jobs/${id}`)
      } catch {
        return { error: "Failed to update job" }
      }
      return null
    },
    null
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!defaults) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the job listing details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Modify the fields below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={defaults.title}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={defaults.description}
                rows={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={defaults.location}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select name="employmentType" defaultValue={defaults.employmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="salaryMin">Salary Min</Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  defaultValue={defaults.salaryMin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salaryMax">Salary Max</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  defaultValue={defaults.salaryMax}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={defaults.tags}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas.
              </p>
            </div>
            <fieldset className="space-y-1.5">
              <span className="text-sm leading-none font-medium select-none">Status</span>
              <div className="flex gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    defaultChecked={defaults.status === "draft"}
                    className="accent-primary"
                  />
                  <span className="text-sm">Draft</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    defaultChecked={defaults.status === "published"}
                    className="accent-primary"
                  />
                  <span className="text-sm">Published</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="closed"
                    defaultChecked={defaults.status === "closed"}
                    className="accent-primary"
                  />
                  <span className="text-sm">Closed</span>
                </label>
              </div>
            </fieldset>
            {state?.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving\u2026" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
