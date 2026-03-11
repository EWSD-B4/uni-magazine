import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ label, value }) {
  return (
    <Card className="bg-card py-6 gap-2">
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-3xl font-bold text-foreground mt-1">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </CardContent>
    </Card>
  )
}