"use client";

import * as React from "react"
import { StatCard } from "@/components/StatCard"
import { ContributionBarChart } from "@/components/ContributionBarChart"
import { StatusCard } from "@/components/StatusCard"
import { DataTable } from "@/components/DataTable"
import { useRouter } from "next/navigation";


// Sample data for the chart
const chartData = [
  { name: "ENG", contributions: 28, color: "#F26454CC" },
  { name: "IT", contributions: 12, color: "#F26454CC" },
  { name: "ART", contributions: 15, color: "#F26454CC" },
  { name: "SCIENCE", contributions: 32, color: "#F26454CC" },
  { name: "MATH", contributions: 24, color: "#F26454CC" },
  { name: "PHYSICS", contributions: 26, color: "#F26454CC" },
]

// Sample data for article status
const articleStatuses = [
  { label: "Approved", percentage: 62, color: "#016630" },
  { label: "Pending", percentage: 24, color: "#FFDF20" },
  { label: "Rejected", percentage: 14, color: "#9F0712" },
]

// Sample user data
const usersData = [
  { id: 1, title: "The Future  of Technology", faculty: "IT", date: "Feb 07, 2026", status: "Active" },
  { id: 2, title: "The Future  of Technology", faculty: "IT", date: "Feb 07, 2026", status: "Active" },
  { id: 3, title: "The Future  of Arts", faculty: "Arts", date: "Feb 07, 2026", status: "Inactive" },
  { id: 4, title: "The Future  of Physics", faculty: "Physics", date: "Feb 07, 2026", status: "Inactive" },
  { id: 5, title: "The Future  of Maths", faculty: "Maths", date: "Feb 07, 2026", status: "Active" },
  { id: 6, title: "The Future  of English", faculty: "English", date: "Feb 07, 2026", status: "Active" },
]

// Generate more users to reach 128 total
const generateMoreUsers = () => {
  const additionalUsers = []
  const roles = ["Student", "Marketing Manager", "Marketing Coordinator"]
  const faculties = ["IT", "Arts", "Physics", "Maths", "English", "Science"]
  const statuses = ["Active", "Inactive"]
  
  for (let i = 7; i <= 128; i++) {
    additionalUsers.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@kmd.edu.mm`,
      role: roles[Math.floor(Math.random() * roles.length)],
      faculty: faculties[Math.floor(Math.random() * faculties.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    })
  }
  return additionalUsers
}

const allUsers = [...usersData, ...generateMoreUsers()]

const columns = [
  {
    key: "id",
    header: "No.",
    render: (_, __, index) => `${index + 1}.`,
  },
  {
    key: "title",
    header: "Title",
    render: (value) => <span className="text-foreground font-medium">{String(value)}</span>,
  },
  {
    key: "date",
    header: "Submitted On",
  },
  {
    key: "faculty",
    header: "Faculty",
  },
]

export default function ManagerDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Semester")
  const router = useRouter();

  const tableActions = [
    { 
      label: "View",  
      onClick: (row) => {
        router.push(`articles/arts-after-hours`);
      }, 
    },
    { label: "Download", onClick: (row) => console.log("Edit", row) },
  ]


  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Contributions" value={1284} />
            <StatCard label="Pending Reviews" value={42} />
            <StatCard label="Selected Contributions" value={856} />
            <StatCard label="Total Faculties" value={6} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ContributionBarChart
                data={chartData}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </div>
            <StatusCard
              statuses={articleStatuses}
              deadline={{
                label: "Submission deadline for Issue #12:",
                date: "Apr 15, 2026",
              }}
            />
          </div>

          {/* Data Table */}
          <h3 className="text-2xl font-bold text-foreground mb-8">Selected Contributions</h3>
          <DataTable
            data={allUsers}
            columns={columns}
            pageSize={6}
            actions={tableActions}
          />
        </main>
      </div>
    </div>
  )
}
