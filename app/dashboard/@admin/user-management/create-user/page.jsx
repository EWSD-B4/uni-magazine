import CreateUserForm from "@/components/admin/CreateUserForm";
import { getFaculties, getRoles } from "@/lib/actions/admin.action";

export default async function CreateUserPage() {
  const [faculties, roleOptions] = await Promise.all([getFaculties(), getRoles()]);

  return <CreateUserForm faculties={faculties} roleOptions={roleOptions} />;
}
