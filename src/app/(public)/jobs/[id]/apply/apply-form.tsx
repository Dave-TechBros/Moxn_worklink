"use client"

import { useState, useCallback, useEffect } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { applyToJob } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type Step = 1 | 2 | 3

interface ProfileData {
  name: string
  headline: string
  location: string
  skills: string[]
  resumeFileId: string
}

export function ApplyForm({
  jobId,
  jobTitle,
  companyName,
  profile,
}: {
  jobId: string
  jobTitle: string
  companyName: string
  profile: ProfileData
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverNote, setCoverNote] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const applyAction = useCallback(
    async (_prev: unknown, formData: FormData) => {
      return await applyToJob(jobId, formData)
    },
    [jobId]
  )

  const [state, formAction, isPending] = useActionState(applyAction, null)

  useEffect(() => {
    if (state && typeof state === "object" && "success" in state && state.success) {
      toast.success("Application submitted successfully!")
      router.push("/dashboard/candidate/applications")
    }
    if (state && typeof state === "object" && "error" in state && state.error) {
      toast.error(state.error as string)
    }
  }, [state, router])

  const validateStep = (s: Step): boolean => {
    const next: Record<string, string> = {}
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const canProceed = () => {
    if (step === 1) return true
    if (step === 2) return true
    return false
  }

  const steps: { num: Step; label: string }[] = [
    { num: 1, label: "Profile" },
    { num: 2, label: "Resume & Cover Note" },
    { num: 3, label: "Review & Submit" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Apply for {jobTitle}</h1>
        <p className="text-sm text-muted-foreground">{companyName}</p>
      </div>

      <div className="flex items-center justify-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 text-sm ${
                step === s.num
                  ? "text-primary font-medium"
                  : step > s.num
                  ? "text-muted-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  step === s.num
                    ? "bg-primary text-primary-foreground"
                    : step > s.num
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? "\u2713" : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-px w-12 sm:w-20 ${
                  step > s.num ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form action={formAction}>
        <input type="hidden" name="resumeFileId" value={profile.resumeFileId} />
        <input type="hidden" name="coverNote" value={coverNote} />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={profile.name} readOnly />
              </div>
              <div className="space-y-1">
                <Label>Headline</Label>
                <Input value={profile.headline || "No headline set"} readOnly />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={profile.location || "No location set"} readOnly />
              </div>
              {profile.skills.length > 0 && (
                <div className="space-y-1">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Update your profile in{" "}
                <a href="/dashboard/candidate/profile" className="text-primary hover:underline">
                  settings
                </a>{" "}
                if anything looks wrong.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Resume & Cover Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="resume">
                  Resume {profile.resumeFileId ? "(leave empty to use current on file)" : ""}
                </Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                {resumeFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {resumeFile.name}
                  </p>
                )}
                {errors.resume && (
                  <p className="text-xs text-destructive mt-1">{errors.resume}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="coverNote">Cover Note (optional)</Label>
                <Textarea
                  id="coverNote"
                  placeholder="Introduce yourself and explain why you're a great fit..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={5}
                />
                {errors.coverNote && (
                  <p className="text-xs text-destructive mt-1">{errors.coverNote}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Position:</span> {jobTitle} at {companyName}
                </p>
                <p>
                  <span className="font-medium">Name:</span> {profile.name}
                </p>
                {profile.headline && (
                  <p>
                    <span className="font-medium">Headline:</span> {profile.headline}
                  </p>
                )}
                {coverNote && (
                  <div>
                    <span className="font-medium">Cover Note:</span>
                    <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                      {coverNote}
                    </p>
                  </div>
                )}
                {resumeFile && (
                  <p>
                    <span className="font-medium">Resume:</span> {resumeFile.name}
                  </p>
                )}
              </div>
              {state && typeof state === "object" && "error" in state && state.error && (
                <p className="text-sm text-destructive">{state.error as string}</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((step - 1) as Step)}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => {
                if (validateStep(step)) setStep((step + 1) as Step)
              }}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
