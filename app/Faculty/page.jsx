"use client"

import { useMemo, useState } from "react"
import { StatCard } from "@/components/StatCard"
import { DataTable } from "@/components/DataTable"

// Generate faculty data
const generateFaculty = () => {
    const users = []
    const names = [
        "001234",
        "001235",
        "001236",
        "001237",
        "001238",
    ]
    const faculties = ["IT", "Arts", "Physics", "Maths", "English"]
    const statuses = ["Active", "Inactive"]

    for (let i = 1; i <= 10; i++) {
        users.push({
            id: i,
            name: names[Math.floor(Math.random() * names.length)],
            faculty: faculties[Math.floor(Math.random() * faculties.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
        })
    }

    return users
}

// ✅ Modified Columns (match your UI)
const columns = [
    { key: "id", header: "No.", render: (_, __, index) => `${index + 1}.` },
    { key: "name", header: "Code" }, // your image shows name under "Code"
    { key: "faculty", header: "Faculty" },
    {
        key: "status",
        header: "Status",
        render: (value) => (
            <span
                className={`font-medium ${value === "Active" ? "text-green-600" : "text-red-500"
                    }`}
            >
                {value}
            </span>
        ),
    },
]

export default function FacultyPage() {
    const [users, setUsers] = useState(generateFaculty())

    const filteredUsers = useMemo(() => users, [users])

    const tableActions = [
        {
            label: "Deactivate",
            onClick: (row) => {
                setUsers((prev) =>
                    prev.map((user) =>
                        user.id === row.id ? { ...user, status: "Inactive" } : user
                    )
                )
            },
        },
        {
            label: "Delete",
            onClick: (row) => {
                const confirmDelete = window.confirm(
                    `Are you sure?\n\nThis will delete ${row.name}.`
                )
                if (confirmDelete) {
                    setUsers((prev) => prev.filter((user) => user.id !== row.id))
                }
            },
        },
    ]

    return (
        <div className="p-6 space-y-6">

            {/* ✅ Only ONE Stat Card */}
            <div className="w-fit">
                <StatCard label="Faculty" value={users.length} />
            </div>

            {/* ✅ Table */}
            <DataTable
                data={filteredUsers}
                columns={columns}
                pageSize={6}
                actions={tableActions}
            />
        </div>
    )
}