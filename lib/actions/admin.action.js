"use server"

import { redirect } from "next/navigation"
import { login, logout } from "@/lib/mockAuth"
import { clearAuthCookies, setAuthCookies } from "@/lib/cookies"

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const result = await login(email, password)
  await setAuthCookies(result)
  redirect("/dashboard")
}

export async function logoutAction() {
  await logout()
  await clearAuthCookies()
  redirect("/login")
}
