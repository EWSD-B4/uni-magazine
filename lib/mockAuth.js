import { DEFAULT_FACULTY, FACULTIES, normalizeFaculty } from "@/lib/faculties"

const ALLOWED_ROLES = ["student", "coordinator", "manager", "admin", "guest"]
const ROLE_DEFAULT_FACULTY = {
  student: "Engineering & Design",
  coordinator: "Business & Economics",
  manager: DEFAULT_FACULTY,
  admin: DEFAULT_FACULTY,
  guest: "Arts & Humanities",
}

const FACULTY_KEYWORDS = [
  {
    faculty: "Arts & Humanities",
    keywords: ["arts", "humanities", "literature", "culture"],
  },
  {
    faculty: "Business & Economics",
    keywords: ["business", "economics", "marketing", "commerce"],
  },
  {
    faculty: "Engineering & Design",
    keywords: ["engineering", "design", "prototype", "studio"],
  },
  {
    faculty: "Health & Life Sciences",
    keywords: ["health", "life", "medical", "clinical"],
  },
  {
    faculty: "Law & Governance",
    keywords: ["law", "governance", "policy", "public"],
  },
  {
    faculty: "Science & Technology",
    keywords: ["science", "technology", "tech", "research"],
  },
]

const MOCK_ACCOUNT_DIRECTORY = {
  "student@university.edu": {
    role: "student",
    faculty: "Engineering & Design",
    userId: "student-001",
  },
  "coordinator@university.edu": {
    role: "coordinator",
    faculty: "Business & Economics",
    userId: "coordinator-001",
  },
  "manager@university.edu": {
    role: "manager",
    faculty: DEFAULT_FACULTY,
    userId: "manager-001",
  },
  "admin@university.edu": {
    role: "admin",
    faculty: DEFAULT_FACULTY,
    userId: "admin-001",
  },
  "guest@university.edu": {
    role: "guest",
    faculty: "Arts & Humanities",
    userId: "guest-001",
  },
}

function inferRoleFromEmail(email) {
  if (!email) return "student"
  const lower = email.toLowerCase()
  const exactMatch = MOCK_ACCOUNT_DIRECTORY[lower]?.role

  if (exactMatch) {
    return exactMatch
  }

  const match = ALLOWED_ROLES.find((role) => lower.includes(role))
  return match || "student"
}

function inferFacultyFromEmail(email, role) {
  const lower = email.toLowerCase()
  const exactMatch = MOCK_ACCOUNT_DIRECTORY[lower]?.faculty

  if (exactMatch) {
    return exactMatch
  }

  const keywordMatch = FACULTY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => lower.includes(keyword))
  )?.faculty

  if (keywordMatch && FACULTIES.includes(keywordMatch)) {
    return keywordMatch
  }

  return ROLE_DEFAULT_FACULTY[role] || DEFAULT_FACULTY
}

function inferUserIdFromEmail(email) {
  const lower = email.toLowerCase()
  const exactMatch = MOCK_ACCOUNT_DIRECTORY[lower]?.userId

  if (exactMatch) {
    return exactMatch
  }

  const localPart = lower.split("@")[0] || "user"
  return `${localPart.replace(/[^a-z0-9]+/g, "-") || "user"}-mock`
}

export async function login(email, password) {
  void password
  const role = inferRoleFromEmail(email)

  return {
    token: "mock-token",
    role,
    faculty: normalizeFaculty(inferFacultyFromEmail(email, role)),
    userId: inferUserIdFromEmail(email),
  }
}

export async function logout() {
  return { ok: true }
}

export { ALLOWED_ROLES }
