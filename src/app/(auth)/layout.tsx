"use client"

import { ThemeToggle } from "@/components/shared/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Moxn <span className="text-primary">Worklink</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-role job marketplace
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
