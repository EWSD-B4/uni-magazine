"use client"

import { useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, User, Plus } from "lucide-react"

export default function EditAccountPage() {
  const router = useRouter()
  const params = useParams()
  const fileInputRef = useRef(null) // Reference for the hidden file input

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [faculty, setFaculty] = useState("IT")
  const [role, setRole] = useState("Marketing Manager")
  const [imagePreview, setImagePreview] = useState(null) // State for image preview

  const faculties = ["IT", "Physics", "English", "Arts"]
  const roles = ["Marketing Coordinator", "Student", "Guest", "Marketing Manager"]

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File is too large! Max 1MB.")
        return
      }
      // Create a temporary URL for the selected local file
      setImagePreview(URL.createObjectURL(file))
    }
  }

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
        className="mb-8 flex items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white transition hover:bg-[#d95a4a]"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSave} className="flex flex-col items-center space-y-10">

          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div
              className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-300 ring-2 ring-white transition hover:ring-[#f26b5b]"
              onClick={() => fileInputRef.current.click()} // Trigger hidden input
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <User size={48} className="text-gray-700" />
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                <Plus size={24} className="text-white" />
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h2 className="mt-4 text-2xl font-medium text-black">Upload Image</h2>
            <p className="text-sm text-gray-500">Max file size: 1MB</p>
          </div>

          {/* Centered Input Grid */}
          <div className="grid w-full max-w-2xl grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#f26b5b]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">Faculty</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#f26b5b]"
              >
                {faculties.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#f26b5b]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-black">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#f26b5b]"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pt-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-white px-10 py-3 text-black shadow-sm transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-full bg-[#f26b5b] px-10 py-3 font-medium text-white shadow-md transition hover:bg-[#d95a4a]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}