import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function EmptyState({ icon = "\u2205", title, description, action }: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-4xl text-muted-foreground" aria-hidden="true">{icon}</span>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && (
          action.href ? (
            <a href={action.href} className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-2.5 h-8 text-sm font-medium whitespace-nowrap hover:bg-primary/80">
              {action.label}
            </a>
          ) : (
            <Button onClick={action.onClick} variant="default">
              {action.label}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
