import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '模具成本计算器 - 舒瀚科技',
  description: '注塑模具成本估算 & 注塑件单件成本计算',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
