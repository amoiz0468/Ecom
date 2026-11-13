import { getAdminSession } from "@/lib/auth/admin";
import { AdminShellClient } from "@/components/admin/AdminShellClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <AdminShellClient username={session?.username}>
      {children}
    </AdminShellClient>
  );
}
