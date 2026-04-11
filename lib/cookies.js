import { cookies } from "next/headers"

const TOKEN_COOKIE = "um_token"
const ROLE_COOKIE = "um_role"
const FACULTY_COOKIE = "um_faculty"
const USER_ID_COOKIE = "um_user_id"
const USER_NAME_COOKIE = "um_user_name"
const USER_EMAIL_COOKIE = "um_user_email"
const ROLE_ID_COOKIE = "um_role_id"

export async function getAuthFromCookies() {
  const store = await cookies()
  return {
    token: store.get(TOKEN_COOKIE)?.value || null,
    role: store.get(ROLE_COOKIE)?.value || null,
    faculty: store.get(FACULTY_COOKIE)?.value || null,
    id: store.get(USER_ID_COOKIE)?.value || null,
    name: store.get(USER_NAME_COOKIE)?.value || null,
    email: store.get(USER_EMAIL_COOKIE)?.value || null,
    roleId: store.get(ROLE_ID_COOKIE)?.value || null,
  }
}

export async function setAuthCookies({
  token,
  role,
  faculty,
  id,
  name,
  userId,
  userName,
  email,
  roleId,
}) {
  const resolvedId = id ?? userId ?? ""
  const resolvedName = name ?? userName ?? ""
  const resolvedEmail = email ?? ""
  const store = await cookies()
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  store.set(ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  store.set(FACULTY_COOKIE, faculty, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  store.set(USER_ID_COOKIE, String(resolvedId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })

  store.set(USER_NAME_COOKIE, String(resolvedName), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })

  store.set(USER_EMAIL_COOKIE, String(resolvedEmail), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })

  if (roleId !== undefined && roleId !== null && roleId !== "") {
    store.set(ROLE_ID_COOKIE, String(roleId), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
  } else {
    store.delete(ROLE_ID_COOKIE)
  }
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete(TOKEN_COOKIE)
  store.delete(ROLE_COOKIE)
  store.delete(FACULTY_COOKIE)
  store.delete(USER_ID_COOKIE)
  store.delete(USER_NAME_COOKIE)
  store.delete(USER_EMAIL_COOKIE)
  store.delete(ROLE_ID_COOKIE)
}

export {
  TOKEN_COOKIE,
  ROLE_COOKIE,
  FACULTY_COOKIE,
  USER_ID_COOKIE,
  USER_NAME_COOKIE,
  USER_EMAIL_COOKIE,
  ROLE_ID_COOKIE,
}
