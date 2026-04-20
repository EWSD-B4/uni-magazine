"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts"

const periods = ["This Semester", "Last Semester", "This Year", "Last Year"]

export function ContributionBarChart({
  data,
  title = "Faculty Contribution Distribution",
  subtitle = "CURRENT ACADEMIC TERM",
  selectedPeriod = "This Semester",
  onPeriodChange,
  showPeriodSelector = true,
}) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            {subtitle}
          </p>
        </div>
        {showPeriodSelector ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs px-3"
              >
                {selectedPeriod.toUpperCase()}
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {periods.map((period) => (
                <DropdownMenuItem
                  key={period}
                  onClick={() => onPeriodChange?.(period)}
                >
                  {period}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737373", fontSize: 12 }}
                domain={[0, 35]}
                ticks={[0, 5, 10, 15, 20, 25, 30, 35]}
              />
              <Bar dataKey="contributions" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#F26454CC"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
