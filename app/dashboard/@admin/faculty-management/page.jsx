import { FacultyClient } from "@/components/admin/FacultyClient";
import { getFaculties } from "@/lib/actions/admin.action";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export default async function FacultyPage() {
  const faculties = await getFaculties();
  const initialData = (Array.isArray(faculties) ? faculties : []).map(
    (faculty, index) => ({
      id: asString(faculty?.id, String(index + 1)),
      code: asString(faculty?.code ?? faculty?.facultyCode ?? faculty?.id, "-"),
      faculty: asString(
        typeof faculty === "string" ? faculty : faculty?.name,
        "N/A",
      ),
    }),
  );

  return (
    <div className="p-6">
      <FacultyClient initialData={initialData} />
    </div>
  );
}
