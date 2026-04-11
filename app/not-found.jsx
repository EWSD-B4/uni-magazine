"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6">

            <div className="text-center space-y-8">

                {/* Floating 404 */}
                <h1 className="text-[120px] font-bold text-blue-600 animate-bounce">
                    404
                </h1>

                {/* Title */}
                <h2 className="text-3xl font-semibold text-gray-800">
                    Oops! Page Not Found
                </h2>

                {/* Description */}
                <p className="text-gray-500 max-w-md mx-auto">
                    The page you're looking for might have been removed,
                    renamed, or is temporarily unavailable.
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-4">

                    <Link
                        href="/"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-lg transition"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                </div>

            </div>

        </div>
    )
}
