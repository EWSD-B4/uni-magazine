"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";

import { forgetPasswordAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrangeCircleLoader } from "@/components/ui/orange-circle-loader";

const INITIAL_STATE = {
  ok: false,
  message: "",
};

export default function ForgetPasswordPage() {
  const [actionState, formAction, isPending] = useActionState(
    forgetPasswordAction,
    INITIAL_STATE,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#d9d2c7]">
      <form action={formAction} className="flex w-[380px] flex-col items-center space-y-6">
        <Link href="/">
          <Image
            src="/logo_black.svg"
            alt="Campus Mag"
            width={200}
            height={200}
            className="mb-6"
          />
        </Link>

        <div className="w-full space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            name="email"
            type="email"
            placeholder="example@gmail.com"
            className="h-12 rounded-full border-none bg-white/70 px-5"
            required
            disabled={isPending}
          />
        </div>

        {actionState?.message ? (
          <p
            className={`w-full rounded-md px-4 py-2 text-sm ${
              actionState.ok
                ? "border border-green-300 bg-green-50 text-green-700"
                : "border border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {actionState.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-full bg-[#f05c4c] text-base text-white hover:bg-[#e14d3f]"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <OrangeCircleLoader size="sm" />
              Sending...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>

        <Button
          asChild
          type="button"
          variant="outline"
          className="h-12 w-full rounded-full border-[#f05c4c] text-[#f05c4c] hover:bg-[#f05c4c]/10"
        >
          <Link href="/login">Back to Login</Link>
        </Button>
      </form>
    </div>
  );
}
