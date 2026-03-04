"use server"

import { redirect } from "next/navigation"
import { logout } from "@/lib/mockAuth"
import { clearAuthCookies } from "@/lib/cookies"

export async function logoutAction() {
  await logout()
  await clearAuthCookies()
  redirect("/login")
}
