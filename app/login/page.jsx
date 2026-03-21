// import Link from "next/link"

// import CredentialLoginForm from "@/components/CredentialLoginForm"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// export default function LoginPage() {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#e7eef5_45%,_#dfe7f0_100%)]">
//       <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(14,116,144,0.35),_transparent_70%)] blur-3xl" />
//       <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-[radial-gradient(circle,_rgba(244,124,95,0.45),_transparent_70%)] blur-3xl" />

//       <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
//         <header className="flex flex-wrap items-center justify-between gap-4 text-sm">
//           <Link href="/" className="text-base font-semibold tracking-tight">
//             University Magazine
//           </Link>
//           <nav className="flex items-center gap-2">
//             <Button variant="ghost" asChild>
//               <Link href="/terms">Terms</Link>
//             </Button>
//             <Button variant="ghost" asChild>
//               <Link href="/statistics">Statistics</Link>
//             </Button>
//           </nav>
//         </header>

//         <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
//           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
//             <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
//               Contribution System
//             </span>
//             <h1 className="font-[var(--font-display)] text-4xl leading-tight text-slate-900 md:text-6xl">
//               Publish student stories with a clear editorial flow.
//             </h1>
//             <p className="max-w-xl text-base text-slate-600 md:text-lg">
//               Review drafts, manage deadlines, and align every article with the
//               university magazine standard. This frontend is fully mocked for
//               production-ready UI and flows.
//             </p>
//             <div className="flex flex-wrap gap-3">
//               <Button asChild>
//                 <Link href="/">Back to overview</Link>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/terms">Submission policy</Link>
//               </Button>
//             </div>
//             <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600 shadow-sm">
//               Demo hint: use emails like `student@university.edu`,
//               `coordinator@university.edu`, `manager@university.edu`,
//               `admin@university.edu`, or `guest@university.edu`. You can also
//               include a faculty keyword such as `engineering` or `business` in
//               the email to change the mocked faculty response.
//             </div>
//           </div>

//           <Card className="border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right-6 duration-700">
//             <CardHeader className="space-y-2">
//               <CardTitle className="text-2xl">Login</CardTitle>
//               <CardDescription>
//                 Sign in with your campus email and password. The mocked backend
//                 returns role and faculty.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <CredentialLoginForm />
//             </CardContent>
//             <CardFooter className="text-xs text-muted-foreground">
//               Access is provisioned by faculty coordinators. Contact your
//               coordinator if you need an account.
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"
import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { loginAction } from "@/lib/actions/student.action"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#d9d2c7]">

      <form action={loginAction} className="flex flex-col items-center w-[380px] space-y-6">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Campus Mag"
          width={80}
          height={80}
        />

        {/* Email */}
        <div className="w-full space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email
          </label>

          <Input
            name="email"
            type="email"
            placeholder="example@gmail.com"
            className="rounded-full bg-white/70 border-none h-12 px-5"
            required
          />
        </div>

        {/* Password */}
        <div className="w-full space-y-2 relative">
          <label className="text-sm font-medium text-gray-700">
            Password
          </label>

          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            className="rounded-full bg-white/70 border-none h-12 px-5 pr-10"
            required
          />

          {/* Eye Icon */}
          {/* <div
            className="absolute right-4 top-[38px] cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div> */}
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full h-12 rounded-full bg-[#f05c4c] hover:bg-[#e14d3f] text-white text-base"
        >
          Login
        </Button>

      </form>

    </div>
  )
}
