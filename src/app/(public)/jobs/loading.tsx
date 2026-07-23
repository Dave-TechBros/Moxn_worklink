import { ListSkeleton } from "@/components/shared/loading-skeleton"

export default function JobsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
      <ListSkeleton count={5} />
    </div>
  )
}
