'use client';

import { formatCNY } from '@/lib/format';

interface Props {
  moldCost: number;
  materialCostPerPart: number;
  machineCostPerPart: number;
  otherCostPerPart: number;
}

const VOLUMES = [100, 1000, 5000, 10000, 50000, 100000];

export default function VolumeAnalysis({ moldCost, materialCostPerPart, machineCostPerPart, otherCostPerPart }: Props) {
  const variableCost = materialCostPerPart + machineCostPerPart + otherCostPerPart;

  const rows = VOLUMES.map((qty) => {
    const moldPerPart = qty > 0 ? moldCost / qty : 0;
    const totalPerPart = moldPerPart + variableCost;
    const totalProject = totalPerPart * qty;
    return { qty, moldPerPart, variableCost, totalPerPart, totalProject };
  });

  // 找到最经济的量级（单件成本下降幅度最大的拐点）
  let bestIdx = rows.length - 1;
  for (let i = 1; i < rows.length; i++) {
    const drop = (rows[i - 1].totalPerPart - rows[i].totalPerPart) / rows[i - 1].totalPerPart;
    if (drop < 0.1) { bestIdx = i - 1; break; }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">📊 量产经济性分析</h3>
      <p className="text-xs text-gray-400 mb-4">不同产量下的单件成本变化，帮你找到最优生产批量</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-500 font-medium">产量</th>
              <th className="text-right py-2 text-gray-500 font-medium">模具分摊/件</th>
              <th className="text-right py-2 text-gray-500 font-medium">变动成本/件</th>
              <th className="text-right py-2 text-gray-500 font-medium">单件总成本</th>
              <th className="text-right py-2 text-gray-500 font-medium">项目总成本</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.qty}
                className={`border-b border-gray-50 ${idx === bestIdx ? 'bg-green-50' : ''}`}
              >
                <td className="py-2.5 font-medium text-gray-900">
                  {row.qty.toLocaleString()}
                  {idx === bestIdx && <span className="ml-1.5 text-xs text-green-600 font-normal">← 推荐</span>}
                </td>
                <td className="py-2.5 text-right text-gray-600">{formatCNY(row.moldPerPart)}</td>
                <td className="py-2.5 text-right text-gray-600">{formatCNY(row.variableCost)}</td>
                <td className="py-2.5 text-right font-medium text-gray-900">{formatCNY(row.totalPerPart)}</td>
                <td className="py-2.5 text-right text-gray-600">{formatCNY(row.totalProject)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
        低产量时模具成本占主导，高产量时材料和机台成本占主导。找到拐点就是你的最优批量。
      </div>
    </div>
  );
}
