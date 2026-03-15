// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { canEditArticle } from "@/lib/article-access"
// import { requireAuthSession } from "@/lib/auth"
// import { listArticles } from "@/lib/mockArticles"

// export default async function StudentDashboardPage() {
//   const viewer = await requireAuthSession()
//   const ownedArticles = listArticles().filter((article) =>
//     canEditArticle(article, viewer)
//   )

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
//           Student Submission
//         </h2>
//         <p className="text-sm text-muted-foreground">
//           Draft your article, attach assets, and monitor review progress.
//         </p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <Card className="bg-white/80">
//           <CardHeader className="space-y-2">
//             <CardTitle className="text-base">Current draft</CardTitle>
//             <CardDescription>Outline and submission status.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4 text-sm text-muted-foreground">
//             {ownedArticles.length ? (
//               <div className="space-y-3">
//                 {ownedArticles.map((article) => (
//                   <div
//                     key={article.id}
//                     className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3"
//                   >
//                     <p className="font-medium text-slate-800">{article.title}</p>
//                     <p className="mt-1 text-xs text-slate-500">
//                       {article.section} • {article.readTime}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
//                 No owned drafts available yet.
//               </div>
//             )}
//             <Button className="w-full" asChild>
//               <Link href="/articles">Browse articles</Link>
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className="bg-white/80">
//           <CardHeader className="space-y-2">
//             <CardTitle className="text-base">Submission checklist</CardTitle>
//             <CardDescription>Before you share with editors.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-2 text-sm text-muted-foreground">
//             <p>• Confirm faculty approval</p>
//             <p>• Add images and captions</p>
//             <p>• Include required credits</p>
//             <Button variant="secondary" className="mt-2 w-full">
//               Request review
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="bg-white/85">
//         <CardHeader className="space-y-2">
//           <CardTitle className="text-base">Edit your drafts</CardTitle>
//           <CardDescription>
//             Editing is only available from the student dashboard.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {ownedArticles.length ? (
//             ownedArticles.map((article) => (
//               <div
//                 key={article.id}
//                 className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
//               >
//                 <div className="space-y-1">
//                   <p className="font-medium text-slate-800">{article.title}</p>
//                   <p className="text-xs text-slate-500">
//                     {article.faculty} • {article.section}
//                   </p>
//                 </div>
//                 <Button asChild>
//                   <Link href={`/dashboard/${article.id}/edit`}>Edit draft</Link>
//                 </Button>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               You do not have any editable drafts in the mocked dataset.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

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
        <Header userName="Yoh Yoh" />

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