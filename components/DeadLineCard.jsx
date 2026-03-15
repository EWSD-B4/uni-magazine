import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const variantStyles = {
  submission: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleColor: "text-red-500",
  },
  update: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    iconBg: "bg-cyan-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-600",
  },
}

const defaultIcons = {
  submission: Calendar,
  update: Clock,
}

export function DeadlineCard({
  title,
  date,
  description,
  variant = "submission",
  icon,
  className,
}) {
  const styles = variantStyles[variant]
  const Icon = icon || defaultIcons[variant]

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 px-5 py-4",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className={cn("rounded-lg p-2", styles.iconBg)}>
        <Icon className={cn("h-5 w-5", styles.iconColor)} />
      </div>
      <div className="flex flex-col">
        <span className={cn("text-sm font-medium", styles.titleColor)}>
          {title}
        </span>
        <span className="text-base font-semibold text-foreground">{date}</span>
        <span className="mt-1 text-sm text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}