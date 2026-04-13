import StudentBottomNav from '@/components/layouts/StudentBottomNav';
import StripeRule from '@/components/ui/StripeRule';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StripeRule />
      <main style={{ flex: 1, paddingBottom: '80px' }}>{children}</main>
      <StudentBottomNav />
    </div>
  );
}
