import UserTable from "@/components/admin/UserTable";
import { getFaculties, getUsers } from "@/lib/actions/admin.action";

export default async function AdminPage() {
  const [users, faculties] = await Promise.all([getUsers(), getFaculties()]);
  return <UserTable initialUsers={users} faculties={faculties} />;
}
