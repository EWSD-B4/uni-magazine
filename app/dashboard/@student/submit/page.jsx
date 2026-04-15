import { redirect } from "next/navigation"

import StudentContributionSubmitForm from "@/components/StudentContributionSubmitForm"
import SubmissionDeadlinesSection from "@/components/student/SubmissionDeadlinesSection"
import { requireAuthSession } from "@/lib/auth"
import { getCurrentAcademicYearDeadlines } from "@/lib/actions/student.action"

export default async function StudentSubmitContributionPage() {
  const session = await requireAuthSession()

  if (session.role !== "student") {
    redirect("/dashboard")
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
      <StudentContributionSubmitForm />
    </div>
  )
}
