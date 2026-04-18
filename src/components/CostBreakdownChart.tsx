'use client';

import type { CostBreakdownItem } from '@/lib/types';
import { formatCNY, formatPercent } from '@/lib/format';

interface Props {
  items: CostBreakdownItem[];
  total: number;
  title: string;
}

export default function CostBreakdownChart({ items, total, title }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {/* 横向条形图 */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-900 font-medium">
                {formatCNY(item.cost)} ({formatPercent(item.percentage)})
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(item.percentage, 1)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 总计 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">合计</span>
          <span className="text-xl font-bold text-blue-600">{formatCNY(total)}</span>
        </div>
      </div>
    </div>
  );
}
