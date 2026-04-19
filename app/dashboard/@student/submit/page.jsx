import { unstable_noStore as noStore } from "next/cache"

import StudentContributionSubmitForm from "@/components/StudentContributionSubmitForm"
import SubmissionDeadlinesSection from "@/components/student/SubmissionDeadlinesSection"
import { requireAuthSession } from "@/lib/auth"
import { getCurrentAcademicYearDeadlines } from "@/lib/actions/student.action"
import { isDeadlinePassed } from "@/lib/helpers/deadline"

export default async function StudentSubmitContributionPage() {
  noStore()
  const session = await requireAuthSession()

  if (session.role !== "student") {
    return null
  }

  let deadlines = {
    closureDate: "",
    closureFinalDate: "",
  }

  try {
    deadlines = await getCurrentAcademicYearDeadlines()
  } catch {
    deadlines = {
      closureDate: "",
      closureFinalDate: "",
    }
  }
  const isSubmissionLocked = isDeadlinePassed(deadlines?.closureDate)

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Student Submit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Submit Contributions
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Upload one Word file per contribution, add up to 5 photos, and submit
          up to 3 contributions in total.
        </p>
      </header>

      <SubmissionDeadlinesSection deadlines={deadlines} />
      {isSubmissionLocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          New submission deadline has passed. You can no longer submit new articles.
        </div>
      ) : (
        <StudentContributionSubmitForm />
      )}
    </div>
  )
}
