"use server"

import { logoutAction as authLogoutAction } from "@/lib/actions/auth";

export async function logoutAction() {
  return authLogoutAction();
}
