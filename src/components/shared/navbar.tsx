"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"

interface NavbarProps {
  email: string
  role: string
  name?: string
}

export function Navbar({ email, role, name }: NavbarProps) {
  const initials = (name || email).substring(0, 2).toUpperCase()

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href={role === "candidate" ? "/jobs" : "/dashboard"} className="text-xl font-bold tracking-tight">
            Moxn Worklink
          </Link>
          <NavLinks role={role} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{name || email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={role === "candidate" ? "/dashboard/candidate/profile" : "/dashboard"}>
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="group/dropdown-menu-item relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive outline-hidden select-none hover:bg-destructive/10 dark:hover:bg-destructive/20">
                  Log out
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function NavLinks({ role }: { role: string }) {
  if (role === "candidate") {
    return (
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
          Browse Jobs
        </Link>
        <Link href="/dashboard/candidate/applications" className="text-muted-foreground hover:text-foreground transition-colors">
          My Applications
        </Link>
        <Link href="/dashboard/candidate/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          Profile
        </Link>
      </nav>
    )
  }
  if (role === "employer") {
    return (
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link href="/dashboard/employer/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
          My Jobs
        </Link>
      </nav>
    )
  }
  if (role === "admin") {
    return (
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link href="/dashboard/admin/companies" className="text-muted-foreground hover:text-foreground transition-colors">
          Companies
        </Link>
        <Link href="/dashboard/admin/flags" className="text-muted-foreground hover:text-foreground transition-colors">
          Flags
        </Link>
      </nav>
    )
  }
  return null
}
