import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await verifySession()

  switch (session.role) {
    case "admin":
      redirect("/dashboard/admin/companies")
    case "employer":
      redirect("/dashboard/employer/jobs")
    case "candidate":
      redirect("/jobs")
    default:
      redirect("/login")
  }
}
