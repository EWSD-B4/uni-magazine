"use client"

import { BookOpen, ArrowDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const defaultData = [
  { id: 1, page: "Home Page", views: 3200 },
  { id: 2, page: "Submissions Page", views: 2475 },
  { id: 3, page: "Edit Page", views: 1965 },
  { id: 4, page: "Student Dashboard", views: 1725 },
  { id: 5, page: "Article Page", views: 1480 },
]

export function MostViewedPage({ data = defaultData, className }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-sky-300">
          <BookOpen className="h-6 w-6 text-foreground" />
          Most Viewed Page
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="text-foreground font-semibold">No.</TableHead>
              <TableHead className="text-foreground font-semibold text-center">Page</TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                <span className="inline-flex items-center gap-1">
                  Views <ArrowDown className="h-4 w-4" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id} className="border-b-0 hover:bg-muted/50">
                <TableCell className="font-medium">{index + 1}.</TableCell>
                <TableCell className="text-center">{item.page}</TableCell>
                <TableCell className="text-right">{item.views.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
