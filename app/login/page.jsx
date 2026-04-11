"use client";
import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#d9d2c7]">
      <form
        action={loginAction}
        className="flex flex-col items-center w-[380px] space-y-6"
      >
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
  );
}
