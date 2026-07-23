"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EMPLOYMENT_TYPES, SALARY_RANGES } from "@/lib/utils"

export function JobsFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const [keyword, setKeyword] = useState(q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      params.set("page", "1")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value || undefined })
    }, 300)
  }

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search jobs by keyword..."
        value={keyword}
        onChange={(e) => handleKeywordChange(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Any location"
            defaultValue={searchParams.get("location") || ""}
            onChange={(e) => {
              clearTimeout(debounceRef.current)
              debounceRef.current = setTimeout(() => {
                updateParams({ location: e.target.value || undefined })
              }, 300)
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={searchParams.get("employmentType") || ""}
            onValueChange={(value) => updateParams({ employmentType: value || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {EMPLOYMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Date posted</Label>
          <Select
            value={searchParams.get("datePosted") || ""}
            onValueChange={(value) => updateParams({ datePosted: value || undefined })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any time</SelectItem>
              <SelectItem value="24h">Past 24 hours</SelectItem>
              <SelectItem value="week">Past week</SelectItem>
              <SelectItem value="month">Past month</SelectItem>
              <SelectItem value="3months">Past 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Salary range</Label>
        <div className="flex flex-wrap gap-2">
          {SALARY_RANGES.map((range) => {
            const active = searchParams.get("salaryMin") === String(range.min)
            return (
              <Button
                key={range.label}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (active) {
                    updateParams({ salaryMin: undefined, salaryMax: undefined })
                  } else {
                    updateParams({
                      salaryMin: String(range.min),
                      salaryMax: range.max ? String(range.max) : undefined,
                    })
                  }
                }}
              >
                {range.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
