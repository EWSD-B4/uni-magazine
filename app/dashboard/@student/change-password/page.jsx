import { redirect } from "next/navigation";

export default async function StudentChangePasswordPage() {
  redirect("/reset-password");
}
