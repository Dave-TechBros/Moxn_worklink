import { ListSkeleton } from "@/components/shared/loading-skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of your job applications.</p>
      </div>
      <ListSkeleton count={4} />
    </div>
  )
}
