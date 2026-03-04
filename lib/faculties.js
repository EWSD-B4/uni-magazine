export const FACULTIES = [
  "Arts & Humanities",
  "Business & Economics",
  "Engineering & Design",
  "Health & Life Sciences",
  "Law & Governance",
  "Science & Technology",
]

export const DEFAULT_FACULTY = FACULTIES[0]

export function normalizeFaculty(faculty) {
  return FACULTIES.includes(faculty) ? faculty : DEFAULT_FACULTY
}
