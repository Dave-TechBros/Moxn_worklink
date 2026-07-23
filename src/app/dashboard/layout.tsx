import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/shared/navbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  let name: string | undefined
  if (session.role === "candidate") {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.userId } })
    name = profile?.name
  } else if (session.role === "employer") {
    const company = await prisma.company.findUnique({ where: { ownerUserId: session.userId } })
    name = company?.name
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar email={session.email} role={session.role} name={name} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
