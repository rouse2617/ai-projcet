'use client';

import { useState } from 'react';
import type { SavedQuote } from '@/lib/quoteStore';
import type { MoldCostInput } from '@/lib/types';
import { deleteQuote } from '@/lib/quoteStore';
import { formatCNY } from '@/lib/format';

interface Props {
  quotes: SavedQuote[];
  onLoadQuote: (input: MoldCostInput) => void;
  onRefresh: () => void;
}

export default function QuoteHistory({ quotes, onLoadQuote, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = quotes.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.projectName.toLowerCase().includes(s) ||
      q.partDescription.toLowerCase().includes(s) ||
      q.input.coreSteelGrade.toLowerCase().includes(s)
    );
  });

  const displayed = expanded ? filtered : filtered.slice(0, 5);

  const handleDelete = (id: string) => {
    deleteQuote(id);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-base font-semibold text-gray-900">报价历史</h3>
          <span className="text-xs text-gray-400">{quotes.length} 条记录</span>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">
          <p>暂无历史报价</p>
          <p className="mt-1 text-xs">保存报价后，系统会自动积累数据，为你推荐相似件</p>
        </div>
      ) : (
        <>
          {/* 搜索 */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目名、零件描述、钢材..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3 outline-none focus:border-blue-400"
          />

          {/* 列表 */}
          <div className="space-y-2">
            {displayed.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{q.projectName}</div>
                  <div className="flex flex-wrap gap-x-2 text-xs text-gray-400 mt-0.5">
                    <span>{q.features.numberOfCavities}穴</span>
                    <span>{q.input.coreSteelGrade.toUpperCase()}</span>
                    <span>{new Date(q.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{formatCNY(q.result.totalCost)}</span>
                  <button
                    onClick={() => onLoadQuote(q.input)}
                    className="text-xs text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="加载此报价"
                  >
                    加载
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium w-full text-center"
            >
              {expanded ? '收起' : `查看全部 ${filtered.length} 条`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
