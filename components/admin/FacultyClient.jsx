"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { DataTable } from "@/components/DataTable"
import { CreateFacultyModal } from "./CreateFacultyModal"

// ✅ Columns stay here because they contain functions (render)
const columns = [
    { key: "id", header: "No.", render: (_, __, index) => `${index + 1}.` },
    { key: "name", header: "Code" },
    { key: "faculty", header: "Faculty" },
    {
        key: "status",
        header: "Status",
        render: (value) => (
            <span className={`font-medium ${value === "Active" ? "text-green-600" : "text-red-500"}`}>
                {value}
            </span>
        ),
    },
]

export function FacultyClient({ initialData }) {
    const [users, setUsers] = useState(initialData)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: "", faculty: "" })

    const filteredUsers = useMemo(() => users, [users])

    const handleAddFaculty = (e) => {
        e.preventDefault()
        const newEntry = {
            id: Date.now(),
            name: formData.name,
            faculty: formData.faculty,
            status: "Active",
        }
        setUsers([...users, newEntry])
        setIsModalOpen(false)
        setFormData({ name: "", faculty: "" })
    }

    const tableActions = [
        {
            label: "Deactivate",
            onClick: (row) => {
                setUsers((prev) => prev.map((u) => u.id === row.id ? { ...u, status: "Inactive" } : u))
            },
        },
        {
            label: "Delete",
            onClick: (row) => {
                if (window.confirm(`Delete ${row.name}?`)) {
                    setUsers((prev) => prev.filter((u) => u.id !== row.id))
                }
            },
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <StatCard label="Faculty" value={users.length} />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#f26b5b] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d95a4a]"
                >
                    <Plus size={20} /> Create New Faculty
                </button>
            </div>

            <DataTable
                data={filteredUsers}
                columns={columns}
                pageSize={6}
                actions={tableActions}
            />

            <CreateFacultyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddFaculty}
                formData={formData}
                setFormData={setFormData}
            />
        </div>
    )
}