import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'タスク管理 | Productivity Hub',
  description: 'タスク管理・進捗追跡・見積精度分析',
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
