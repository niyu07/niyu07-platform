import { Metadata } from 'next';
import ReceiptList from '../components/ReceiptList';

export const metadata: Metadata = {
  title: '領収書管理 | 会計管理',
  description: '領収書の一覧表示と管理',
};

export default function ReceiptsPage() {
  return <ReceiptList />;
}
