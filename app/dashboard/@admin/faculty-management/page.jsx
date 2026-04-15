import { FacultyClient } from "@/components/admin/FacultyClient"

export default function FacultyPage() {
  // We only define simple data here. No functions!
  const initialData = [
    { id: 1, name: "001234", faculty: "IT", status: "Active" },
    { id: 2, name: "001235", faculty: "Arts", status: "Inactive" },
  ]

  return (
    <div className="p-6">
      <FacultyClient initialData={initialData} />
    </div>
  )
}