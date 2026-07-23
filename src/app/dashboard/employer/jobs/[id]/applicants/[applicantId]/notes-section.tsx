"use client"

import * as React from "react"
import { saveInternalNote } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function NotesSection({
  applicationId,
  initialNotes,
}: {
  applicationId: string
  initialNotes: string
}) {
  const [notes, setNotes] = React.useState(initialNotes)
  const [saving, setSaving] = React.useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const result = await saveInternalNote(applicationId, notes)
      if (result.success) {
        toast.success("Notes saved")
      }
    } catch {
      toast.error("Failed to save notes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add internal notes about this candidate..."
        rows={4}
      />
      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "Saving…" : "Save Notes"}
      </Button>
    </div>
  )
}
