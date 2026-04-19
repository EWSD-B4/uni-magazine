import { NextResponse } from "next/server";

function isDashboardPath(pathname) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function middleware(request) {
  const token = request.cookies.get("um_token")?.value;
  const role = String(request.cookies.get("um_role")?.value || "").toLowerCase();

  if (!token) {
    return NextResponse.next();
  }

  if (role === "guest" && isDashboardPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/articles";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

