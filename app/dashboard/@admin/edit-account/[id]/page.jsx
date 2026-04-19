import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

import { getFaculties, getUsers } from "@/lib/actions/admin.action";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export default async function EditAccountPage({ params }) {
  const { id } = await params;
  const [users, faculties] = await Promise.all([getUsers(), getFaculties()]);

  const user = (Array.isArray(users) ? users : []).find(
    (item) => asString(item?.id) === asString(id),
  );

  if (!user) {
    notFound();
  }

  const facultyOptions = (Array.isArray(faculties) ? faculties : []).map((item) =>
    typeof item === "string" ? item : asString(item?.name),
  );
  const roleOptions = Array.from(
    new Set((Array.isArray(users) ? users : []).map((item) => asString(item?.role))),
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#e8e3dc] px-6 py-8">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#f26b5b] px-6 py-3 text-white"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gray-300">
            <User size={42} className="text-gray-700" />
          </div>

          <h2 className="mt-4 text-2xl font-medium text-black">Account Details</h2>
          <p className="text-sm text-gray-500">Loaded from backend</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-black">Full Name</label>
              <input
                type="text"
                value={asString(user?.name)}
                readOnly
                className="w-full rounded-md border bg-white px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-black">Email</label>
              <input
                type="email"
                value={asString(user?.email)}
                readOnly
                className="w-full rounded-md border bg-white px-4 py-3"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-black">Faculty</label>
              <select
                value={asString(user?.faculty)}
                disabled
                className="w-full rounded-md border bg-white px-4 py-3"
              >
                {facultyOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-black">Role</label>
              <select
                value={asString(user?.role)}
                disabled
                className="w-full rounded-md border bg-white px-4 py-3"
              >
                {roleOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:block" />
        </div>

        <p className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
          Account update API is not connected on this page yet. Displayed values are
          from backend only.
        </p>
      </div>
    </div>
  );
}
