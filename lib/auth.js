import { redirect } from "next/navigation"

import { getAuthFromCookies } from "@/lib/cookies"
import { ALLOWED_ROLES } from "@/lib/mockAuth"

export const ROLE_LABELS = {
  student: "Student",
  coordinator: "Marketing Coordinator",
  manager: "Manager",
  admin: "Admin",
  guest: "Guest",
}

export const FACULTY_SCOPED_ROLES = new Set([
  "student",
  "coordinator",
  "guest",
])

export async function requireAuthSession() {
  const auth = await getAuthFromCookies()

  if (!auth.token) {
    redirect("/login")
  }

  return {
    token: auth.token,
    role: ALLOWED_ROLES.includes(auth.role) ? auth.role : "guest",
    faculty: auth.faculty,
    id: auth.id,
    name: auth.name,
    email: auth.email,
    roleId: auth.roleId,
  }
}

export function isFacultyScopedRole(role) {
  return FACULTY_SCOPED_ROLES.has(role)
}
