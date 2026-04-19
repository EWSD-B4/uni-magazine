"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UrgentTasksDialog } from "@/components/UrgentTasksDialog"

export function UrgentTasksBanner({
  title = "14-Day Review Deadline",
  buttonText = "View Urgent Tasks",
  submissionCount = 8,
  message = "are approaching the deadline. Please review them immediately.",
  urgentTasks = [],
  urgentTasksError = "",
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border-l-4 border-l-[#f47c6c] bg-background px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Bell className="size-5 text-[#f47c6c]" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="rounded-full bg-[#f47c6c] px-5 text-sm font-medium text-white hover:bg-[#e56b5b]"
          >
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="max-w-lg p-0">
          <UrgentTasksDialog
            submissionCount={submissionCount}
            message={message}
            urgentTasks={urgentTasks}
            urgentTasksError={urgentTasksError}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
