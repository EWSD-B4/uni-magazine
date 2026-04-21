"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { changePasswordAction } from "@/lib/actions/auth";
import { OrangeCircleLoader } from "@/components/ui/orange-circle-loader";

const INITIAL_STATE = {
  ok: false,
  message: "",
};

export default function StudentChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");

  const [actionState, formAction, isPending] = useActionState(
    changePasswordAction,
    INITIAL_STATE,
  );

  function handleSubmit(event) {
    setClientError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      event.preventDefault();
      setClientError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      event.preventDefault();
      setClientError("Passwords do not match.");
    }
  }

  return (
    <div className="min-h-screen bg-[#e8e3dc] px-6 py-8">
      <Link
        href="/dashboard"
        className="mb-10 flex w-fit items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4">
          <h1 className="text-lg font-semibold">Campus Mag</h1>
        </div>

        <h1 className="mb-10 text-4xl font-bold text-black">Change Password</h1>

        <form action={formAction} onSubmit={handleSubmit} className="w-full space-y-8">
          <div>
            <label className="mb-2 block text-sm text-black">Current Password :</label>
            <input
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">New Password :</label>
            <input
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">Re-enter Password :</label>
            <input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none"
            />
          </div>

          {clientError ? (
            <p className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              {clientError}
            </p>
          ) : null}

          {actionState?.message ? (
            <p
              className={`rounded-md px-4 py-2 text-sm ${
                actionState.ok
                  ? "border border-green-300 bg-green-50 text-green-700"
                  : "border border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {actionState.message}
            </p>
          ) : null}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full bg-[#f26b5b] px-10 py-3 font-semibold text-white disabled:opacity-70"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <OrangeCircleLoader size="sm" />
                  Saving...
                </span>
              ) : (
                "Confirm Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
