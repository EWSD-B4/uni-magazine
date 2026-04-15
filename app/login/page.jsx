"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#d9d2c7]">
      <form
        action={loginAction}
        className="flex flex-col items-center w-[380px] space-y-6"
      >
        {error ? (
          <p className="w-full rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {/* Logo */}
        <Image src="/logo.png" alt="Campus Mag" width={80} height={80} />

        {/* Email */}
        <div className="w-full space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>

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
          <label className="text-sm font-medium text-gray-700">Password</label>

          <Input
            name="password"
            type="password"
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
  );
}
