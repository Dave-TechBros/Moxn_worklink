"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type ProfileData = {
  name: string
  headline: string | null
  location: string | null
  skills: string
  portfolioUrl: string | null
  linkedinUrl: string | null
  resumeFileId: string | null
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter()
  const skillsValue = JSON.parse(profile.skills).join(", ")

  const wrappedAction = async (_prevState: unknown, formData: FormData) => {
    const result = await updateProfile(formData)
    return result
  }

  const [state, formAction, isPending] = useActionState(wrappedAction, null)

  useEffect(() => {
    if (state && "success" in state && state.success) {
      toast.success("Profile updated successfully")
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and resume.</p>
      </div>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your name, headline, and location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={profile.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" name="headline" defaultValue={profile.headline ?? ""} placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={profile.location ?? ""} placeholder="e.g. San Francisco, CA" />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Skills & Links</CardTitle>
            <CardDescription>Add your skills and professional links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" name="skills" defaultValue={skillsValue} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input id="portfolioUrl" name="portfolioUrl" defaultValue={profile.portfolioUrl ?? ""} placeholder="https://your-portfolio.com" type="url" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/your-profile" type="url" />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Upload or update your resume file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.resumeFileId ? (
              <p className="text-sm text-muted-foreground">A resume file is attached to your profile.</p>
            ) : (
              <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
