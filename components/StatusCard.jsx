import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

export function StatusCard({ statuses, deadline }) {
  return (
    <Card className="bg-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Article Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.map((status) => (
          <div key={status.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground uppercase tracking-wide text-xs">
                {status.label}
              </span>
              <span className="font-semibold" style={{ color: status.color }}>
                {status.percentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color,
                }}
              />
            </div>
          </div>
        ))}

        {deadline && (
          <div className="flex items-start gap-2 pt-4 border-t border-border mt-14">
            <Bell className="size-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span>{deadline.label}</span>
              <br />
              <span className="font-medium text-foreground">{deadline.date}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
