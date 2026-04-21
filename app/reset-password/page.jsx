import StudentChangePasswordForm from "@/components/student/StudentChangePasswordForm";
import { requireAuthSession } from "@/lib/auth";

export default async function ResetPasswordPage() {
  const session = await requireAuthSession();
  const backHref = session.role === "guest" ? "/articles" : "/dashboard";

  return <StudentChangePasswordForm backHref={backHref} />;
}
