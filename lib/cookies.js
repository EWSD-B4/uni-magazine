import { cookies } from "next/headers"

const TOKEN_COOKIE = "um_token"
const ROLE_COOKIE = "um_role"
const FACULTY_COOKIE = "um_faculty"
const USER_ID_COOKIE = "um_user_id"

export async function getAuthFromCookies() {
  const store = await cookies()
  return {
    token: store.get(TOKEN_COOKIE)?.value || null,
    role: store.get(ROLE_COOKIE)?.value || null,
    faculty: store.get(FACULTY_COOKIE)?.value || null,
    userId: store.get(USER_ID_COOKIE)?.value || null,
  }
}

export async function setAuthCookies({ token, role, faculty, userId }) {
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
  store.set(USER_ID_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete(TOKEN_COOKIE)
  store.delete(ROLE_COOKIE)
  store.delete(FACULTY_COOKIE)
  store.delete(USER_ID_COOKIE)
}

export { TOKEN_COOKIE, ROLE_COOKIE, FACULTY_COOKIE, USER_ID_COOKIE }
