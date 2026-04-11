//Academic Admin Dashboard Version 3
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/StatCard"
import { DataTable } from "@/components/DataTable"

// Generate initial Academic Years
const generateAcademicYears = () => {
    const years = []
    let id = 1

    for (let y = 2025; y >= 2021; y--) {
        years.push({
            id: id++,
            year: `${y}-${y + 1}`,
            open: `2026-03-01`,
            close: `2026-08-30`,
            final: `2026-09-15`,
            status: y === 2025 ? "Active" : "Closed",
        })
    }

    return years
}

// Table Columns
const columns = [
    { key: "id", header: "No." },
    { key: "year", header: "Academic Year" },
    { key: "open", header: "Submission Open" },
    { key: "close", header: "Closure Date" },
    { key: "final", header: "Final Closure" },
    { key: "status", header: "Status" },
]

export default function AcademicYearPage() {

    const [data, setData] = useState(generateAcademicYears())
    const [showModal, setShowModal] = useState(false)
    const [editingRow, setEditingRow] = useState(null)

    const [formData, setFormData] = useState({
        year: "",
        open: "",
        close: "",
        final: "",
        status: "Active"
    })

    // Open Create Modal
    const openCreate = () => {
        setEditingRow(null)
        setFormData({
            year: "",
            open: "",
            close: "",
            final: "",
            status: "Active"
        })
        setShowModal(true)
    }

    // Open Edit Modal
    const openEdit = (row) => {
        setEditingRow(row)

        setFormData({
            year: row.year,
            open: row.open,
            close: row.close,
            final: row.final,
            status: row.status
        })

        setShowModal(true)
    }

    // Save (Create or Update)
    const saveAcademicYear = () => {

        if (editingRow) {
            // Update existing row
            const updated = data.map((item) =>
                item.id === editingRow.id ? { ...item, ...formData } : item
            )

            setData(updated)

        } else {
            // Create new row
            const newEntry = {
                id: data.length + 1,
                ...formData
            }

            setData([...data, newEntry])
        }

        setShowModal(false)
    }

    // Delete
    const deleteYear = (row) => {

        const confirmDelete = confirm(
            `Are you absolutely sure?\n\nThis action cannot be undone.\n\nThis will permanently delete ${row.year} from our servers.`
        )

        if (confirmDelete) {
            setData(data.filter((item) => item.id !== row.id))
        }
    }

    // Table Actions
    const tableActions = [
        {
            label: "Edit",
            onClick: openEdit
        },
        {
            label: "Close",
            onClick: (row) => {
                // Find the row by ID and update only the status field
                const updated = data.map((item) =>
                    item.id === row.id ? { ...item, status: "Closed" } : item
                )
                setData(updated)
            }
        },
        {
            label: "Delete",
            onClick: deleteYear
        },
    ]

    return (
        <div className="p-6 space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <StatCard
                    label="Current Academic Year"
                    value="2025-2026"
                    className="bg-blue-500 text-white"
                />

                <StatCard
                    label="Submissions Open"
                    value="March 1, 2026"
                    className="bg-green-500 text-white"
                />

                <StatCard
                    label="Submissions Deadline"
                    value="August 30, 2026"
                    className="bg-orange-500 text-white"
                />

                <StatCard
                    label="Final Closure Date"
                    value="September 15, 2026"
                    className="bg-red-500 text-white"
                />

            </div>

            {/* Create Button */}
            <div className="flex justify-end">
                <Button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={openCreate}
                >
                    <Plus size={18} />
                    Create Academic Year
                </Button>
            </div>

            {/* Table */}
            <DataTable
                data={data}
                columns={columns}
                pageSize={6}
                actions={tableActions}
            />

            {/* Modal */}
            {showModal && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

                        <h2 className="text-xl font-semibold">
                            {editingRow ? "Edit Academic Year" : "Create Academic Year"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Academic Year (2026-2027)"
                            className="w-full border p-2 rounded"
                            value={formData.year}
                            onChange={(e) =>
                                setFormData({ ...formData, year: e.target.value })
                            }
                        />

                        <input
                            type="date"
                            className="w-full border p-2 rounded"
                            value={formData.open}
                            onChange={(e) =>
                                setFormData({ ...formData, open: e.target.value })
                            }
                        />

                        <input
                            type="date"
                            className="w-full border p-2 rounded"
                            value={formData.close}
                            onChange={(e) =>
                                setFormData({ ...formData, close: e.target.value })
                            }
                        />

                        <input
                            type="date"
                            className="w-full border p-2 rounded"
                            value={formData.final}
                            onChange={(e) =>
                                setFormData({ ...formData, final: e.target.value })
                            }
                        />

                        <select
                            className="w-full border p-2 rounded"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({ ...formData, status: e.target.value })
                            }
                        >
                            <option>Active</option>
                            <option>Closed</option>
                        </select>

                        <div className="flex justify-end gap-2">

                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="bg-blue-600 text-white"
                                onClick={saveAcademicYear}
                            >
                                {editingRow ? "Update" : "Create"}
                            </Button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}