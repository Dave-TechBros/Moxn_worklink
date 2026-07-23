import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/shared/empty-state"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const session = await verifySession()

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.userId },
  })

  if (!profile) {
    return <EmptyState title="Profile not found" description="Please contact support." />
  }

  return <ProfileForm profile={profile} />
}
