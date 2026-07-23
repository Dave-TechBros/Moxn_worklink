import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { formatDate } from "@/lib/utils"
import { EmptyState, ErrorState } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { suspendCompany } from "@/lib/actions"

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await verifySession()
  if (session.role !== "admin") return <ErrorState title="Forbidden" message="You do not have access to this page" />

  const { q } = await searchParams

  const companies = await prisma.company.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { owner: { email: { contains: q } } },
          ],
        }
      : undefined,
    include: {
      owner: { select: { email: true } },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground">Manage all registered companies</p>
      </div>

      <form className="flex items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" placeholder="Company name or email..." defaultValue={q ?? ""} />
        </div>
        <Button type="submit">Search</Button>
        {q && (
          <a href="/dashboard/admin/companies" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground">
            Clear
          </a>
        )}
      </form>

      {companies.length === 0 ? (
        <EmptyState title="No companies found" description={q ? "Try a different search term" : "No companies have registered yet"} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{companies.length} company{companies.length !== 1 ? "ies" : "y"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-muted-foreground">{company.owner.email}</TableCell>
                    <TableCell>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status === "active" ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>{company._count.jobs}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(company.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <form action={suspendCompany.bind(null, company.id) as unknown as (formData: FormData) => void}>
                        <Button type="submit" variant={company.status === "active" ? "destructive" : "default"} size="sm">
                          {company.status === "active" ? "Suspend" : "Reinstate"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
