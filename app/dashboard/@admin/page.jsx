"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { StatCard } from "@/components/StatCard"
import { DataTable } from "@/components/DataTable"

// Generate users
const generateUsers = () => {
  const users = []
  const names = [
    "Thiri Yadanar",
    "Khaing Thinzar Thwe",
    "Aung Htet Nay",
    "Win Nandar Kyaw",
    "Nay Win Hlaing",
  ]
  const roles = ["Student", "Marketing Coordinator", "Marketing Manager", "Guest"]
  const faculties = ["IT", "Arts", "Physics", "Maths", "English", "Science"]
  const statuses = ["Active", "Inactive"]

  for (let i = 1; i <= 100; i++) {
    users.push({
      id: i,
      name: names[Math.floor(Math.random() * names.length)],
      email: `user${i}@university.edu`,
      role: roles[Math.floor(Math.random() * roles.length)],
      faculty: faculties[Math.floor(Math.random() * faculties.length)],
      date: "Feb 07, 2026",
      status: statuses[Math.floor(Math.random() * statuses.length)],
    })
  }

  return users
}

// Table Columns
const columns = [
  { key: "id", header: "No.", render: (_, __, index) => `${index + 1}.` },
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "faculty", header: "Faculty" },
  { key: "date", header: "Submitted On" },
  {
    key: "status",
    header: "Status",
    render: (value) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${value === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
          }`}
      >
        {value}
      </span>
    ),
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState(generateUsers())
  const [selectedRole, setSelectedRole] = useState("All Roles")
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties")

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatch = selectedRole === "All Roles" || user.role === selectedRole
      const facultyMatch =
        selectedFaculty === "All Faculties" || user.faculty === selectedFaculty
      return roleMatch && facultyMatch
    })
  }, [users, selectedRole, selectedFaculty])

  const tableActions = [
    {
      label: "Reset Password",
      onClick: (row) => router.push(`/dashboard/reset-password/${row.id}`),
    },
    {
      label: "Edit Account",
      onClick: (row) => router.push(`/dashboard/edit-account/${row.id}`),
    },
    {
      label: "Deactivate Account",
      onClick: (row) => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === row.id ? { ...user, status: "Inactive" } : user
          )
        )
      },
    },
    {
      label: "Delete Account",
      onClick: (row) => {
        const confirmDelete = window.confirm(
          `Are you absolutely sure?\n\nThis action cannot be undone.\n\nThis will permanently delete ${row.name}'s account from our servers.`
        )

        if (confirmDelete) {
          setUsers((prev) => prev.filter((user) => user.id !== row.id))
        }
      },
    },
  ]

  const roles = ["All Roles", "Student", "Marketing Coordinator", "Marketing Manager", "Guest"]
  const faculties = ["All Faculties", "IT", "Arts", "Physics", "Maths", "English", "Science"]

  const studentCount = users.filter((u) => u.role === "Student").length
  const coordinatorCount = users.filter((u) => u.role === "Marketing Coordinator").length
  const managerCount = users.filter((u) => u.role === "Marketing Manager").length
  const guestCount = users.filter((u) => u.role === "Guest").length

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Marketing Coordinators" value={coordinatorCount} />
        <StatCard label="Marketing Managers" value={managerCount} />
        <StatCard label="Guests" value={guestCount} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 my-4">
        <select
          className="border rounded px-4 py-2 bg-white"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-4 py-2 bg-white"
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
        >
          {faculties.map((faculty) => (
            <option key={faculty} value={faculty}>
              {faculty}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        pageSize={6}
        actions={tableActions}
      />
    </div>
  )
}



