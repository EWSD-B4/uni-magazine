"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  CirclePlus,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  UserCog,
  X,
} from "lucide-react"

import { logoutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

function isArticleDetailPath(pathname) {
  return /^\/articles\/[^/]+\/?$/.test(pathname || "")
}

function isLoginPath(pathname) {
  return pathname === "/login" || pathname === "/login/"
}

function isLandingPath(pathname) {
  return pathname === "/" || pathname === ""
}

function isForgetPasswordPath(pathname) {
  return pathname === "/forget-password" || pathname === "/forget-password/"
}

function formatUserName(session) {
  if (session?.name) {
    return session.name
  }

  if (session?.userName) {
    return session.userName
  }

  const id = session?.id || session?.userId

  if (!id) {
    return "Guest"
  }

  return id
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function SidebarNavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  onNavigate,
  forceHardNavigate = false,
}) {
  const handleClick = React.useCallback(
    (event) => {
      onNavigate?.()
      if (!forceHardNavigate) return
      event.preventDefault()
      window.location.assign(href)
    },
    [forceHardNavigate, href, onNavigate]
  )

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-200 hover:bg-slate-800/70 hover:text-white",
        active && "bg-slate-800 text-white"
      )}
    >
      <Link href={href} onClick={handleClick}>
        <Icon className="size-4" />
        {!collapsed ? <span>{label}</span> : null}
      </Link>
    </Button>
  )
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  onNavigate,
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "h-11 w-full justify-start gap-3 rounded-xl px-3 text-slate-200 hover:bg-slate-800/70 hover:text-white",
        active && "bg-slate-800 text-white",
        collapsed && "justify-center px-0"
      )}
    >
      <Link href={href} onClick={onNavigate}>
        <Icon className="size-4" />
        {!collapsed ? label : null}
      </Link>
    </Button>
  )
}

function isRouteActive(pathname, href) {
  if (!pathname || !href) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isDashboardHome(pathname) {
  return pathname === "/dashboard" || pathname === "/dashboard/"
}

function SidebarContent({
  collapsed,
  hasSession,
  logoHref,
  canCreateArticle,
  createHref,
  quickLinks,
  showDashboardNav,
  showArticlesNav,
  pathname,
  userName,
  lastLoginLabel,
  onNavigate,
  onClose,
  mobile,
}) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      {mobile ? (
        <div className="flex items-center justify-between">
          <Link
            href={logoHref}
            onClick={onNavigate}
            className="leading-none ml-5"
          >
            <Image
              src="/logo_white.svg"
              alt="Campus Mag"
              width={150}
              height={150}
            />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-200 hover:bg-slate-800/70 hover:text-white"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Link
          href={logoHref}
          className={cn(
            "flex items-center justify-center leading-none",
            collapsed && "lex items-center justify-center"
          )}
        >
          {collapsed ? 
            <Image
              src="/logo_white_mobile.svg"
              alt="Campus Mag"
              width={100}
              height={100}
            /> : <Image
              src="/logo_white.svg"
              alt="Campus Mag"
              width={150}
              height={150}
            />
          }
        </Link>
      )}

      {!collapsed ? (
        <div className="mt-9 space-y-1">
          <p className="text-lg font-semibold">Welcome Back, {userName}!</p>
          <p className="text-xs text-yellow-300">Last Login: {lastLoginLabel}</p>
        </div>
      ) : null}

      <div className="mt-7 space-y-3">
        {showDashboardNav ? (
          <SidebarNavItem
            href="/dashboard"
            icon={LayoutGrid}
            label="Dashboard"
            collapsed={collapsed}
            active={isDashboardHome(pathname)}
            onNavigate={onNavigate}
            forceHardNavigate
          />
        ) : null}
        {showArticlesNav ? (
          <SidebarNavItem
            href="/articles"
            icon={Newspaper}
            label="Articles"
            collapsed={collapsed}
            active={pathname === "/articles"}
            onNavigate={onNavigate}
          />
        ) : null}

        {canCreateArticle ? (
          <QuickActionButton
            href={hasSession ? createHref : "/login"}
            icon={CirclePlus}
            label="Create new article"
            active={isRouteActive(pathname, createHref)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ) : null}

        {quickLinks.map((item) => (
          <QuickActionButton
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isRouteActive(pathname, item.href)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="mt-auto pt-6">
        {hasSession ? (
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              onClick={onNavigate}
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
            <Link href="/login" onClick={onNavigate}>
              <LogIn className="size-4" />
              {!collapsed ? "Login" : null}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default function AppShell({ children, session }) {
  const pathname = usePathname() || "/"
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
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

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (
    isArticleDetailPath(pathname) ||
    isLoginPath(pathname) ||
    isForgetPasswordPath(pathname) ||
    isLandingPath(pathname)
  ) {
    return children
  }

  const hasSession = Boolean(session?.token)
  const role = String(session?.role || "").toLowerCase()
  const isGuest = hasSession && role === "guest"
  const canCreateArticle = hasSession && role === "student"
  const createHref = canCreateArticle ? "/dashboard/submit" : "/dashboard"
  const showDashboardNav = !isGuest
  const showArticlesNav = isGuest
  const logoHref = hasSession ? (isGuest ? "/articles" : "/dashboard") : "/"
  const quickLinks = !hasSession
    ? []
    : role === "admin"
      ? [
          {
            href: "/dashboard/user-management",
            label: "User Management",
            icon: UserCog,
          },
          {
            href: "/dashboard/academic-management",
            label: "Academic Management",
            icon: GraduationCap,
          },
          {
            href: "/dashboard/faculty-management",
            label: "Faculty Management",
            icon: Building2,
          },
        ]
      : role === "student"
        ? [
            {
              href: "/dashboard/change-password",
              label: "Change Password",
              icon: KeyRound,
            },
          ]
        : []
  const userName = formatUserName(session)

  return (
    <div className="min-h-screen md:flex">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-700 bg-black text-white transition-all duration-300 md:flex",
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

        <SidebarContent
          collapsed={collapsed}
          hasSession={hasSession}
          logoHref={logoHref}
          canCreateArticle={canCreateArticle}
          createHref={createHref}
          quickLinks={quickLinks}
          showDashboardNav={showDashboardNav}
          showArticlesNav={showArticlesNav}
          pathname={pathname}
          userName={userName}
          lastLoginLabel={lastLoginLabel}
          mobile={false}
        />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-700 bg-black px-4 py-3 text-white md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-slate-200 hover:bg-slate-800/70 hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <Link
          href={logoHref}
          className="text-2xl font-extrabold leading-none underline decoration-blue-500 decoration-3 underline-offset-4"
        >
          <Image
            src="/logo_white.svg"
            alt="Campus Mag"
            width={100}
            height={100}
          />
        </Link>
        <div className="size-9" />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close menu overlay"
        />

        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-72 border-r border-slate-700 bg-black text-white shadow-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent
            collapsed={false}
            hasSession={hasSession}
            logoHref={logoHref}
            canCreateArticle={canCreateArticle}
            createHref={createHref}
            quickLinks={quickLinks}
            showDashboardNav={showDashboardNav}
            showArticlesNav={showArticlesNav}
            pathname={pathname}
            userName={userName}
            lastLoginLabel={lastLoginLabel}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
            mobile
          />
        </aside>
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
