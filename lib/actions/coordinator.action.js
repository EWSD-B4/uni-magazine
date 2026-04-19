"use server"

import {
  loginAction as authLoginAction,
  logoutAction as authLogoutAction,
} from "@/lib/actions/auth";

export async function loginAction(formData) {
  return authLoginAction(formData);
}

export async function logoutAction() {
  return authLogoutAction();
}
