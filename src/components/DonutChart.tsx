'use client';

import type { CostBreakdownItem } from '@/lib/types';
import { formatCNY, formatPercent } from '@/lib/format';

interface Props {
  items: CostBreakdownItem[];
  total: number;
}

export default function DonutChart({ items, total }: Props) {
  if (items.length === 0) return null;

  const size = 200;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = items.map((item) => {
    const percent = item.percentage / 100;
    const offset = circumference * (1 - cumulativePercent);
    const length = circumference * percent;
    cumulativePercent += percent;
    return { ...item, offset, length };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* 背景圆 */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth}
          />
          {/* 数据段 */}
          {segments.map((seg) => (
            <circle
              key={seg.name}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.offset + circumference}
              className="transition-all duration-700"
            />
          ))}
        </svg>
        {/* 中心文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">合计</span>
          <span className="text-lg font-bold text-gray-900">{formatCNY(total)}</span>
        </div>
      </div>
      {/* 图例 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs w-full">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-gray-500 truncate">{item.name}</span>
            <span className="text-gray-700 font-medium ml-auto">{formatPercent(item.percentage)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
