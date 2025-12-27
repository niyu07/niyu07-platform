import Sidebar from '../components/Sidebar';
import { mockUser } from '../data/mockData';

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar user={mockUser} currentPage="勤怠管理" />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
