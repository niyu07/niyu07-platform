import Sidebar from '../components/Sidebar';
import { mockUser } from '../data/mockData';

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar user={mockUser} currentPage="会計" />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
