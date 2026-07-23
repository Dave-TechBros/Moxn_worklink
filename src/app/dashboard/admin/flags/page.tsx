import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { formatDate } from "@/lib/utils"
import { EmptyState, ErrorState } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { resolveFlag, closeJobAdmin } from "@/lib/actions"

export default async function AdminFlagsPage() {
  const session = await verifySession()
  if (session.role !== "admin") return <ErrorState title="Forbidden" message="You do not have access to this page" />

  const openFlags = await prisma.flag.findMany({
    where: { status: "open" },
    include: { reportedBy: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  })

  const resolvedFlags = await prisma.flag.findMany({
    where: { status: "resolved" },
    include: { reportedBy: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  })

  const flags = [...openFlags, ...resolvedFlags]

  if (flags.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flags & Reports</h1>
          <p className="text-sm text-muted-foreground">Review reported content from users</p>
        </div>
        <EmptyState title="No flags" description="There are no reported items to review" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flags & Reports</h1>
        <p className="text-sm text-muted-foreground">Review reported content from users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{flags.length} flag{flags.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Target ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    <Badge variant="outline">{flag.targetType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{flag.targetId}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{flag.reason}</TableCell>
                  <TableCell className="text-muted-foreground">{flag.reportedBy?.email ?? "Anonymous"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(flag.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={flag.status === "open" ? "destructive" : "secondary"}>
                      {flag.status === "open" ? "Open" : "Resolved"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {flag.status === "open" && (
                      <div className="flex gap-2 justify-end">
                        <form action={resolveFlag.bind(null, flag.id) as unknown as (formData: FormData) => void}>
                          <Button type="submit" variant="outline" size="sm">Resolve</Button>
                        </form>
                        {flag.targetType === "job" && (
                          <form action={closeJobAdmin.bind(null, flag.targetId) as unknown as (formData: FormData) => void}>
                            <Button type="submit" variant="destructive" size="sm">Close Job</Button>
                          </form>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
