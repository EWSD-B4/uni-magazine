import CreateUserForm from "@/components/admin/CreateUserForm";
import { getFaculties, getUsers } from "@/lib/actions/admin.action";

function extractRoleOptions(users) {
  const items = users
    .map((user) => {
      const id = Number(user?.roleId);
      const label = String(user?.role || "").trim();
      if (!Number.isFinite(id) || !label) return null;
      return { id, label };
    })
    .filter(Boolean);

  const deduped = items.filter((item, index, array) => {
    return (
      array.findIndex(
        (candidate) => candidate.id === item.id && candidate.label === item.label,
      ) === index
    );
  });

  return deduped.sort((a, b) => a.label.localeCompare(b.label));
}

export default async function CreateUserPage() {
  const [faculties, users] = await Promise.all([getFaculties(), getUsers()]);
  const roleOptions = extractRoleOptions(users);
  return <CreateUserForm faculties={faculties} roleOptions={roleOptions} />;
}
