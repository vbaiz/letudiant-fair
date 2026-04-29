import AdminSideNav from "@/components/layouts/AdminSideNav";
import RoleGate from "@/components/auth/RoleGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate allow="admin">
      <div className="flex min-h-screen">
        <AdminSideNav />
        <main className="flex-1 le-dashboard-bg p-8">{children}</main>
      </div>
    </RoleGate>
  );
}
