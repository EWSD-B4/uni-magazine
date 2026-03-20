"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, User, Plus } from "lucide-react"

export default function EditAccountPage() {
    const router = useRouter()
    const params = useParams()

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [faculty, setFaculty] = useState("IT")
    const [role, setRole] = useState("Marketing Manager")

    const faculties = ["IT", "Physics", "English", "Arts"]
    const roles = ["Marketing Coordinator", "Student", "Guest", "Marketing Manager"]

    const handleSave = (e) => {
        e.preventDefault()

        if (!fullName || !email) {
            alert("Please fill in Full Name and Email.")
            return
        }

        alert(`User ID ${params.id} updated successfully!`)
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-[#e8e3dc] px-6 py-8">
            <button
                onClick={() => router.back()}
                className="mb-8 flex items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white"
            >
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="mx-auto max-w-5xl">
                <form onSubmit={handleSave} className="space-y-10">
                    <div className="flex flex-col items-center">
                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gray-300">
                            <User size={42} className="text-gray-700" />
                            <div className="absolute right-1 top-1 rounded-full bg-gray-500 p-1 text-white">
                                <Plus size={16} />
                            </div>
                        </div>

                        <h2 className="mt-4 text-2xl font-medium text-black">Upload Image</h2>
                        <p className="text-sm text-gray-500">Max file size: 1MB</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm text-black">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded-md border bg-white px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="w-full rounded-md border bg-white px-4 py-3"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm text-black">Faculty</label>
                                <select
                                    value={faculty}
                                    onChange={(e) => setFaculty(e.target.value)}
                                    className="w-full rounded-md border bg-white px-4 py-3"
                                >
                                    {faculties.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-black">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full rounded-md border bg-white px-4 py-3"
                                >
                                    {roles.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="hidden md:block" />
                    </div>

                    <div className="flex justify-center gap-6 pt-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="rounded-full bg-white px-10 py-3 text-black shadow"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-full bg-[#f26b5b] px-10 py-3 text-black"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
