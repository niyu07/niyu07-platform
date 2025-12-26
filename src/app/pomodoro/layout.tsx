import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ポモドーロタイマー | Productivity Hub',
  description: '集中力を高めて生産性を最大化するポモドーロテクニック',
};

export default function PomodoroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
