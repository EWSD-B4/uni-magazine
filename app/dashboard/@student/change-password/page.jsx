import StudentChangePasswordForm from "@/components/student/StudentChangePasswordForm";
import { requireAuthSession } from "@/lib/auth";

export default async function StudentChangePasswordPage() {
  const session = await requireAuthSession();
  if (session.role !== "student") {
    return null;
  }

  return <StudentChangePasswordForm />;
}
