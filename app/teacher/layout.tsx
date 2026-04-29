import TeacherSideNav from "@/components/layouts/TeacherSideNav";
import RoleGate from "@/components/auth/RoleGate";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate allow="teacher">
      <div className="flex min-h-screen">
        <TeacherSideNav />
        <main className="flex-1 le-dashboard-bg p-8">{children}</main>
      </div>
    </RoleGate>
  );
}
