"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  CirclePlus,
  LayoutGrid,
  LogIn,
  LogOut,
  Newspaper,
} from "lucide-react"

import { logoutAction } from "@/lib/actions/guest.action"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function isArticleDetailPath(pathname) {
  return /^\/articles\/[^/]+\/?$/.test(pathname || "")
}

function formatUserName(session) {
  if (!session?.userId) {
    return "Guest"
  }

  return session.userId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function SidebarNavItem({ href, icon: Icon, label, active, collapsed }) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-200 hover:bg-slate-800/70 hover:text-white",
        active && "bg-slate-800 text-white"
      )}
    >
      <Link href={href}>
        <Icon className="size-4" />
        {!collapsed ? <span>{label}</span> : null}
      </Link>
    </Button>
  )
}

export default function AppShell({ children, session }) {
  const pathname = usePathname() || "/"
  const [collapsed, setCollapsed] = React.useState(false)
  const lastLoginLabel = React.useMemo(
    () =>
      new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  )

  if (isArticleDetailPath(pathname)) {
    return children
  }

  const hasSession = Boolean(session?.token)
  const userName = formatUserName(session)

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "relative flex shrink-0 flex-col border-r border-slate-700 bg-black text-white transition-all duration-300",
          collapsed ? "w-20" : "w-72"
        )}
      >
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="absolute -right-3 top-4 z-10 flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("size-4", collapsed && "rotate-180")} />
        </button>

        <div className="flex h-full flex-col px-4 py-5">
          <Link
            href="/"
            className={cn(
              "text-5xl font-extrabold leading-none underline decoration-blue-500 decoration-3 underline-offset-4",
              collapsed && "text-center text-2xl"
            )}
          >
            {collapsed ? "UM" : "Logo"}
          </Link>

          {!collapsed ? (
            <div className="mt-9 space-y-1">
              <p className="text-lg font-semibold">Welcome Back, {userName}!</p>
              <p className="text-xs text-yellow-300">
                Last Login: {lastLoginLabel}
              </p>
            </div>
          ) : null}

          <div className="mt-7">
            <Button
              asChild
              className={cn(
                "h-12 w-full rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200",
                collapsed && "justify-center rounded-xl px-0"
              )}
            >
              <Link href={hasSession ? "/dashboard" : "/login"}>
                <span className="grid size-7 place-items-center rounded-full bg-red-500 text-white">
                  <CirclePlus className="size-4" />
                </span>
                {!collapsed ? "Create new article" : null}
              </Link>
            </Button>
          </div>

          <nav className="mt-10 space-y-3">
            <SidebarNavItem
              href="/dashboard"
              icon={LayoutGrid}
              label="Dashboard"
              collapsed={collapsed}
              active={pathname.startsWith("/dashboard")}
            />
            <SidebarNavItem
              href="/articles"
              icon={Newspaper}
              label="Articles"
              collapsed={collapsed}
              active={pathname === "/articles"}
            />
          </nav>

          <div className="mt-auto pt-6">
            {hasSession ? (
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className={cn(
                    "h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-200 hover:bg-slate-800/70 hover:text-white",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <LogOut className="size-4" />
                  {!collapsed ? "Logout" : null}
                </Button>
              </form>
            ) : (
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-200 hover:bg-slate-800/70 hover:text-white",
                  collapsed && "justify-center px-0"
                )}
              >
                <Link href="/login">
                  <LogIn className="size-4" />
                  {!collapsed ? "Login" : null}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
