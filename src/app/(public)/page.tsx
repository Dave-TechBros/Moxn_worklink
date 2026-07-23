import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Find Your Next Opportunity
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mb-8">
          Connect with top employers and discover your dream role in a marketplace built for candidates, recruiters, and teams.
        </p>
        <form action="/jobs" method="GET" className="flex w-full max-w-md gap-2 mb-4">
          <Input name="q" placeholder="Search jobs by keyword..." className="h-10" />
          <Button type="submit" size="lg">Search</Button>
        </form>
        <Link href="/jobs" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "no-underline")}>
          Browse Jobs
        </Link>
      </section>
      <footer className="py-8 px-6 border-t">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Moxn Worklink. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
