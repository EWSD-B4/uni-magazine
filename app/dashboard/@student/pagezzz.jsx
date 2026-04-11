
"use client";

import * as React from "react"
import { Header } from "@/components/Header"
import { DeadlineCard } from "@/components/DeadLineCard"
import { DataTable } from "@/components/DataTable"

// Sample user data
const usersData = [
  { id: 1, title: "The Future  of Technology", statues: "Approved", date: "Feb 07, 2026"},
  { id: 2, title: "The Future  of Technology", statues: "Approved", date: "Feb 07, 2026"},
  { id: 3, title: "The Future  of Arts", statues: "Rejected", date: "Feb 07, 2026"},
  { id: 4, title: "The Future  of Physics", statues: "Rejected", date: "Feb 07, 2026"},
  { id: 5, title: "The Future  of Maths", statues: "Pending", date: "Feb 07, 2026"},
  { id: 6, title: "The Future  of English", statues: "Pending", date: "Feb 07, 2026"},
]

// Generate more users to reach 128 total
const generateMoreUsers = () => {


  const additionalUsers = []
  const roles = ["Student", "Marketing Manager", "Marketing Coordinator"]
  const faculties = ["IT", "Arts", "Physics", "Maths", "English", "Science"]
  const statuses = ["Approved", "Rejected", "Pending"]
  
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
    key: "statues",
    header: "Statues",
  },
  {
    key: "date",
    header: "Submitted On",
  },
]

const tableActions = [
  { label: "View", onClick: (row) => console.log("View", row) },
  { label: "Edit", onClick: (row) => console.log("Edit", row) },
]

export default function StudentDashboardPage() {

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header userName= />

        {/* Page Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome */}
          <h1 className="text-3xl font-bold text-foreground mb-15">Welcome, Yoh Yoh</h1>

          {/* Individual Cards Demo */}
          <div className="w-full max-w-2xl space-y-4 mb-15 rounded-lg shadow-sm border bg-background p-6">
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Submission & Updates Deadlines
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <DeadlineCard
                title="New Submissions Deadline:"
                date="March 1, 2026"
                description="Final Date for New Submissions!"
                variant="submission"
                className="flex-1"
              />
              <DeadlineCard
                title="Final Deadline:"
                date="May 15, 2026"
                description="Last Date for Article Editions!"
                variant="update"
                className="flex-1"
              />
            </div>
          </div>

          {/* Data Table */}
          <h3 className="text-2xl font-bold text-foreground mb-8">My Articles</h3>
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
