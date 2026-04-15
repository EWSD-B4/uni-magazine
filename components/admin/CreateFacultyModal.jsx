"use client"

import { X } from "lucide-react"

export function CreateFacultyModal({ isOpen, onClose, onSave, formData, setFormData }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Add New Faculty</h2>

                <form onSubmit={onSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Faculty Code</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#f26b5b]"
                            placeholder="001239"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Faculty Name</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#f26b5b]"
                            placeholder="e.g. Mechanical Engineering"
                            value={formData.faculty}
                            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-[#f26b5b] text-white py-2 rounded-lg font-bold mt-2 hover:bg-[#d95a4a]">
                        Confirm and Create
                    </button>
                </form>
            </div>
        </div>
    )
}