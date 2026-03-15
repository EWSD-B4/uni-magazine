export function UrgentTasksDialog({
  submissionCount = 8,
  message = "are approaching the deadline. Please review them immediately.",
}) {
  return (
    <div className="rounded-lg bg-[#e8e8e8] px-6 py-5">
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-semibold">{submissionCount} submissions</span>{" "}
        {message}
      </p>
    </div>
  )
}
