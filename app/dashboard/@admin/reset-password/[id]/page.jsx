"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
    const router = useRouter()
    const params = useParams()

    const [newPassword, setNewPassword] = useState("")
    const [reenterPassword, setReenterPassword] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!newPassword || !reenterPassword) {
            alert("Please fill in both password fields.")
            return
        }

        if (newPassword !== reenterPassword) {
            alert("Passwords do not match.")
            return
        }

        alert(`Password reset successful for user ID: ${params.id}`)
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-[#e8e3dc] px-6 py-8">
            <button
                onClick={() => router.back()}
                className="mb-10 flex items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white"
            >
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="mb-4">
                    <img
                        src="/logo.png"
                        alt="Campus Mag Logo"
                        className="h-16 w-auto object-contain"
                    />
                </div>

                <h1 className="mb-10 text-4xl font-bold text-black">Reset Password</h1>

                <form onSubmit={handleSubmit} className="w-full space-y-8">
                    <div>
                        <label className="mb-2 block text-sm text-black">New Password :</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-black">Re-enter Password :</label>
                        <input
                            type="password"
                            value={reenterPassword}
                            onChange={(e) => setReenterPassword(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none"
                        />
                    </div>

                    <div className="flex justify-center pt-4">
                        <button
                            type="submit"
                            className="rounded-full bg-[#f26b5b] px-10 py-3 font-semibold text-white"
                        >
                            Confirm Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
