import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const APPLICATION_STATUSES = ["new", "reviewing", "interview", "offer", "closed"] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  new: ["reviewing", "closed"],
  reviewing: ["interview", "closed"],
  interview: ["offer", "closed"],
  offer: ["closed"],
  closed: [],
}

export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export function canTransitionTo(from: ApplicationStatus): ApplicationStatus[] {
  return VALID_TRANSITIONS[from] ?? []
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: "inbox" },
  reviewing: { label: "Reviewing", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: "search" },
  interview: { label: "Interview", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: "calendar" },
  offer: { label: "Offer", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: "check" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: "x" },
}

export const JOB_STATUSES = ["draft", "published", "closed"] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship"] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export const SALARY_RANGES = [
  { label: "Under $50k", min: 0, max: 50000 },
  { label: "$50k - $100k", min: 50000, max: 100000 },
  { label: "$100k - $150k", min: 100000, max: 150000 },
  { label: "$150k+", min: 150000, max: null },
] as const

export function formatSalary(min: number | null, max: number | null, currency = "USD"): string {
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return "Negotiable"
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date))
}

export function timeAgo(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}
