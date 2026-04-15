"use client";

import { DeadlineCard } from "@/components/DeadLineCard";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function SubmissionDeadlinesSection({ deadlines }) {
  return (
    <div className="w-full max-w-2xl space-y-4 mb-15 rounded-lg shadow-sm border bg-background p-6">
      <h3 className="text-2xl font-bold text-foreground mb-8">
        Submission & Updates Deadlines
      </h3>
      <div className="flex flex-col gap-4 sm:flex-row">
        <DeadlineCard
          title="New Submissions Deadline:"
          date={formatDate(deadlines?.closureDate)}
          description="Final Date for New Submissions!"
          variant="submission"
          className="flex-1"
        />
        <DeadlineCard
          title="Final Deadline:"
          date={formatDate(deadlines?.closureFinalDate)}
          description="Last Date for Article Editions!"
          variant="update"
          className="flex-1"
        />
      </div>
    </div>
  );
}
