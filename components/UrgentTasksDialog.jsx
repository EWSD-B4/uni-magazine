import Link from "next/link";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function UrgentTasksDialog({
  submissionCount = 8,
  message = "are approaching the deadline. Please review them immediately.",
  urgentTasks = [],
  urgentTasksError = "",
}) {
  const tasks = Array.isArray(urgentTasks) ? urgentTasks : [];

  return (
    <div className="space-y-4 rounded-lg bg-[#e8e8e8] px-6 py-5">
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-semibold">{submissionCount} submissions</span>{" "}
        {message}
      </p>

      {urgentTasksError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {urgentTasksError}
        </p>
      ) : null}

      {tasks.length ? (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const id = asString(task?.id);
            const title = asString(task?.title, `Contribution #${id}`);
            const tags = Array.isArray(task?.tags) ? task.tags : [];

            return (
              <li
                key={id}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <Link
                  href={`/dashboard/${id}`}
                  className="block font-medium text-slate-900 hover:underline"
                >
                  {title}
                </Link>
                {tags.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={`${id}-${tag}`}
                        className="inline-flex items-center rounded-full bg-[#f47c6c]/15 px-2 py-0.5 text-[11px] font-semibold text-[#b94e41]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">No urgent contributions found.</p>
      )}
    </div>
  )
}
