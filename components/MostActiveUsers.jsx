"use client"

import { Users, ArrowDown } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MostActiveUsers({ data = [], className }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-green-400">
          <Users className="h-6 w-6 text-foreground" />
          Most Active Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="text-foreground font-semibold">No.</TableHead>
              <TableHead className="text-foreground font-semibold text-center">Username</TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                <span className="inline-flex items-center gap-1">
                  Contributions <ArrowDown className="h-4 w-4" />
                </span>
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((user, index) => (
                <TableRow key={user.id} className="border-b-0 hover:bg-muted/50">
                  <TableCell className="font-medium">{index + 1}.</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{user.contributions}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-0">
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  No data from backend.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
